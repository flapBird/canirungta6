import { cpus as defaultCpus, gpus as defaultGpus } from "@/lib/data";
import type {
  BenchmarkValue,
  ComponentResult,
  ComponentStatus,
  CompatibilityResult,
  CPU,
  GameStatus,
  GPU,
  RequirementProfile,
  UserSpecs,
} from "@/lib/types";

export function comparableRatio(user: BenchmarkValue | null, reference: BenchmarkValue | null): number | null {
  if (!user || !reference || user.datasetId !== reference.datasetId || reference.value <= 0) return null;
  const ratio = user.value / reference.value;
  return Number.isFinite(ratio) ? ratio : null;
}

export function compareRatio(ratio: number | null): ComponentStatus {
  if (ratio === null || !Number.isFinite(ratio)) return "unknown";
  if (ratio >= 1) return "meets";
  if (ratio >= 0.8) return "near";
  return "below";
}

function referenceComponent(
  key: "cpu" | "gpu",
  selectedId: string | null,
  referenceIds: string[],
  userScore: BenchmarkValue | null,
  target: BenchmarkValue | null,
  sourceIds: string[],
  profile: RequirementProfile,
): ComponentResult {
  if (!selectedId) {
    return { key, status: "unknown", ratio: null, sourceIds: [...sourceIds], reasonKey: `reason.${key}.missing` };
  }
  const exactMatch = referenceIds.includes(selectedId);
  if (exactMatch) {
    return {
      key,
      status: "meets",
      ratio: null,
      sourceIds: [...sourceIds],
      reasonKey: profile.game === "leonida" ? `reason.${key}.match` : `reason.${key}.noReference`,
    };
  }
  const ratio = comparableRatio(userScore, target);
  if (ratio !== null && !profile.stale) {
    return { key, status: compareRatio(ratio), ratio, sourceIds: [...sourceIds], reasonKey: `reason.${key}.benchmark` };
  }
  return {
    key,
    status: "unknown",
    ratio: null,
    sourceIds: [...sourceIds],
    reasonKey: profile.game === "leonida" ? `reason.${key}.noBenchmark` : `reason.${key}.noReference`,
  };
}

function capacityComponent(
  key: "ram" | "vram",
  value: number | null,
  reference: number | null,
  sourceIds: string[],
  game: RequirementProfile["game"],
): ComponentResult {
  if (reference === null || value === null) {
    return { key, status: "unknown", ratio: null, sourceIds, reasonKey: value === null ? `reason.${key}.missing` : `reason.${key}.noReference` };
  }
  const ratio = value / reference;
  const status = compareRatio(ratio);
  const reasonKey = game === "leonida" && key === "ram"
    ? `reason.ram.${status === "meets" ? "match" : status === "near" ? "near" : "below"}`
    : `reason.${key}.capacity`;
  return { key, status, ratio, sourceIds, reasonKey };
}

export function evaluateCompatibility(
  specs: UserSpecs,
  profile: RequirementProfile,
  status: GameStatus,
  cpuData: CPU[] = defaultCpus,
  gpuData: GPU[] = defaultGpus,
): CompatibilityResult {
  const cpu = specs.cpuId ? cpuData.find((item) => item.id === specs.cpuId) ?? null : null;
  const gpu = specs.gpuId ? gpuData.find((item) => item.id === specs.gpuId) ?? null : null;
  const profileSources = [...profile.sourceIds];
  const cpuSources = [...new Set([...(cpu?.sourceIds ?? []), ...profileSources])];
  const gpuSources = [...new Set([...(gpu?.sourceIds ?? []), ...profileSources])];

  const compareConsole = profile.game === "gta6" && profile.evidenceKind === "forecast" && !!profile.consoleGpuBands;
  const consoleBand = compareConsole && !profile.stale && specs.deviceType === "desktop" && gpu?.deviceType === "desktop"
    ? (["consoleBelow", "consoleNear", "consoleAbove"] as const).find((band) => profile.consoleGpuBands?.[band].includes(gpu.id))
    : undefined;

  const bandStatus = { consoleBelow: "below", consoleNear: "near", consoleAbove: "meets" } as const;
  const gpuResult: ComponentResult = consoleBand
    ? { key: "gpu", status: bandStatus[consoleBand], ratio: null, sourceIds: gpuSources, reasonKey: consoleBand }
    : referenceComponent("gpu", specs.gpuId, profile.referenceGpuIds, gpu?.rasterScore ?? null, profile.gpuTarget, gpuSources, profile);

  const components: ComponentResult[] = [
    referenceComponent("cpu", specs.cpuId, profile.referenceCpuIds, cpu?.gamingScore ?? null, profile.cpuTarget, cpuSources, profile),
    gpuResult,
    capacityComponent("ram", specs.ramGB, profile.ramGB, profileSources, profile.game),
  ];

  const effectiveVram = gpu?.memoryType === "shared" ? null : specs.vramOverrideGB ?? gpu?.vramGB ?? null;
  if (gpu?.memoryType === "shared" && specs.vramOverrideGB === null) {
    components.push({ key: "vram", status: "unknown", ratio: null, sourceIds: gpuSources, reasonKey: "reason.vram.shared" });
  } else {
    components.push(capacityComponent("vram", effectiveVram, profile.vramGB, gpuSources, profile.game));
  }

  if (profile.requiredOs.length === 0) {
    components.push({ key: "os", status: "unknown", ratio: null, sourceIds: profileSources, reasonKey: "reason.os.noReference" });
  } else if (specs.os === "unknown") {
    components.push({ key: "os", status: "unknown", ratio: null, sourceIds: profileSources, reasonKey: "reason.os.missing" });
  } else if (specs.os === "linux" && profile.game === "leonida") {
    components.push({ key: "os", status: "unknown", ratio: null, sourceIds: profileSources, reasonKey: "reason.os.linuxUnknown" });
  } else {
    const meets = profile.requiredOs.includes(specs.os);
    components.push({ key: "os", status: meets ? "meets" : "below", ratio: null, sourceIds: profileSources, reasonKey: meets ? "reason.os.windows" : "reason.os.unsupported" });
  }

  if (profile.requiredArchitecture.length === 0) {
    components.push({ key: "architecture", status: "unknown", ratio: null, sourceIds: profileSources, reasonKey: "reason.architecture.noReference" });
  } else if (specs.architecture === "unknown") {
    components.push({ key: "architecture", status: "unknown", ratio: null, sourceIds: profileSources, reasonKey: "reason.architecture.missing" });
  } else {
    const meets = profile.requiredArchitecture.includes(specs.architecture);
    components.push({ key: "architecture", status: meets ? "meets" : "below", ratio: null, sourceIds: profileSources, reasonKey: meets ? "reason.architecture.match" : "reason.architecture.below" });
  }

  components.push({
    key: "storage",
    status: "unknown",
    ratio: null,
    sourceIds: profileSources,
    reasonKey: profile.game === "leonida" ? "reason.storage.unknown" : "reason.storage.noReference",
  });
  components.push({
    key: "vulkan",
    status: "unknown",
    ratio: null,
    sourceIds: profileSources,
    reasonKey: profile.game === "leonida" ? "reason.vulkan.unknown" : "reason.vulkan.noReference",
  });

  const missingFields = components.filter((component) => component.status === "unknown").map((component) => component.key);
  const limitations = [
    ...(profile.stale ? ["limitation.staleProfile"] : []),
    ...(profile.game === "gta6" ? ["limitation.noOfficial", "limitation.noBenchmark"] : ["limitation.driver"]),
    ...(specs.deviceType === "laptop" ? ["limitation.laptop"] : []),
  ];

  let tier: CompatibilityResult["tier"] = consoleBand ?? "unknown";
  if (!profile.stale && profile.confidence !== "unknown" && profile.evidenceKind === "official") {
    const core = components.filter((component) => ["cpu", "gpu", "ram"].includes(component.key));
    if (core.every((component) => component.status === "meets")) tier = "likely";
    else if (!core.some((component) => component.status === "unknown") && core.some((component) => component.status === "below")) tier = "unlikely";
    else if (!core.some((component) => component.status === "unknown") && core.some((component) => component.status === "near")) tier = "borderline";
  }

  return {
    game: profile.game,
    profileId: profile.id,
    profileVersion: profile.version,
    availability: status.availability,
    tier,
    confidence: compareConsole && !consoleBand ? "unknown" : profile.confidence,
    components,
    limitations,
    missingFields,
    estimatedFps: null,
  };
}
