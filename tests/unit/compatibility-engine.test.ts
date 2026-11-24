import { describe, expect, it } from "vitest";
import { cpus, gameStatuses, gpus, profiles } from "@/lib/data";
import { comparableRatio, compareRatio, evaluateCompatibility } from "@/lib/compatibility-engine";
import { emptySpecs } from "@/lib/url-state";
import { getDictionary } from "@/lib/i18n";
import { locales } from "@/lib/i18n-routes";
import type { CompatibilityResult, UserSpecs } from "@/lib/types";
import { fixtureDifferentDataset, fixtureOfficialProfile, fixtureReference } from "../fixtures/benchmarks";

const gtaProfile = profiles.find((profile) => profile.game === "gta6")!;
const leonidaProfile = profiles.find((profile) => profile.id === "leonida-1080p-low-historical")!;
const gtaStatus = gameStatuses.find((status) => status.game === "gta6")!;
const leonidaStatus = gameStatuses.find((status) => status.game === "leonida")!;

function component(result: CompatibilityResult, key: CompatibilityResult["components"][number]["key"]) {
  return result.components.find((item) => item.key === key)!;
}

function specs(patch: Partial<UserSpecs> = {}): UserSpecs {
  return { ...emptySpecs, ...patch };
}

describe("benchmark comparison", () => {
  it("compares scores only within the same dataset", () => {
    expect(comparableRatio(fixtureReference, fixtureReference)).toBe(1);
    expect(comparableRatio({ ...fixtureReference, value: 80 }, fixtureReference)).toBe(0.8);
    expect(comparableRatio(fixtureDifferentDataset, fixtureReference)).toBeNull();
    expect(comparableRatio(null, fixtureReference)).toBeNull();
    expect(comparableRatio(fixtureReference, null)).toBeNull();
    expect(comparableRatio(fixtureReference, { ...fixtureReference, value: 0 })).toBeNull();
  });

  it("keeps thresholds finite and null-safe", () => {
    expect(compareRatio(1)).toBe("meets");
    expect(compareRatio(0.8)).toBe("near");
    expect(compareRatio(0.79)).toBe("below");
    expect(compareRatio(null)).toBe("unknown");
    expect(compareRatio(Number.NaN)).toBe("unknown");
    expect(compareRatio(Number.POSITIVE_INFINITY)).toBe("unknown");
  });
});

describe("GTA 6 evidence policy", () => {
  it("always returns Unknown without official PC evidence, even for premium hardware", () => {
    const result = evaluateCompatibility(specs({
      cpuId: "amd-ryzen-7-7800x3d",
      gpuId: "nvidia-rtx-5070-desktop",
      ramGB: 128,
      os: "windows11",
      architecture: "x64",
    }), gtaProfile, gtaStatus);

    expect(result.tier).toBe("unknown");
    expect(result.confidence).toBe("unknown");
    expect(result.availability).toBe("unannounced");
    expect(result.estimatedFps).toBeNull();
    expect(component(result, "cpu").status).toBe("unknown");
    expect(component(result, "gpu").status).toBe("unknown");
    expect(component(result, "ram").status).toBe("unknown");
    expect(result.limitations).toContain("limitation.noOfficial");
  });

  it("does not compare fixture scores across datasets or treat null as zero", () => {
    const cpu = { ...cpus[0], gamingScore: fixtureDifferentDataset };
    const result = evaluateCompatibility(specs({ cpuId: cpu.id }), fixtureOfficialProfile, gtaStatus, [cpu]);
    expect(component(result, "cpu").status).toBe("unknown");
    expect(component(result, "cpu").ratio).toBeNull();

    const missing = evaluateCompatibility(specs({ cpuId: cpus[0].id }), fixtureOfficialProfile, gtaStatus);
    expect(component(missing, "cpu").status).toBe("unknown");
    expect(component(missing, "cpu").ratio).toBeNull();
  });
});

describe("Leonida historical profiles", () => {
  it("can match historical component anchors without claiming playability", () => {
    const result = evaluateCompatibility(specs({
      cpuId: "intel-core-i5-12400f",
      gpuId: "nvidia-rtx-3060-12gb-desktop",
      ramGB: 16,
      os: "windows11",
      architecture: "x64",
    }), leonidaProfile, leonidaStatus);

    expect(component(result, "cpu").status).toBe("meets");
    expect(component(result, "gpu").status).toBe("meets");
    expect(component(result, "ram").status).toBe("meets");
    expect(component(result, "os").status).toBe("meets");
    expect(component(result, "architecture").status).toBe("meets");
    expect(result.tier).toBe("unknown");
    expect(result.availability).toBe("not-verified-playable");
    expect(result.estimatedFps).toBeNull();
    expect(result.limitations).toContain("limitation.staleProfile");
  });

  it("keeps a premium unmatched GPU Unknown and driver evidence separate", () => {
    const result = evaluateCompatibility(specs({
      cpuId: "amd-ryzen-7-7800x3d",
      gpuId: "nvidia-rtx-5070-desktop",
      ramGB: 64,
      os: "linux",
      architecture: "x64",
    }), leonidaProfile, leonidaStatus);

    expect(component(result, "gpu").status).toBe("unknown");
    expect(component(result, "os").status).toBe("unknown");
    expect(component(result, "vulkan").status).toBe("unknown");
    expect(component(result, "storage").status).toBe("unknown");
    expect(result.tier).toBe("unknown");
    expect(result.estimatedFps).toBeNull();
  });
});

describe("capacity and unknown fallbacks", () => {
  it("reports RAM and fixture-only VRAM gaps without inventing FPS", () => {
    const result = evaluateCompatibility(specs({
      gpuId: "nvidia-rtx-3060-12gb-desktop",
      ramGB: 8,
      vramOverrideGB: 4,
    }), fixtureOfficialProfile, gtaStatus);

    expect(component(result, "ram").status).toBe("below");
    expect(component(result, "ram").ratio).toBe(0.5);
    expect(component(result, "vram").status).toBe("below");
    expect(component(result, "vram").ratio).toBe(0.5);
    expect(result.estimatedFps).toBeNull();
  });

  it("marks missing selections and unsupported architectures explicitly", () => {
    const result = evaluateCompatibility(specs({ architecture: "arm64" }), leonidaProfile, leonidaStatus);
    expect(component(result, "cpu").status).toBe("unknown");
    expect(component(result, "gpu").status).toBe("unknown");
    expect(component(result, "architecture").status).toBe("below");
    expect(result.missingFields).toContain("cpu");
    expect(result.missingFields).toContain("gpu");
  });

  it("never treats shared memory as dedicated VRAM", () => {
    const sharedGpu: (typeof gpus)[number] = {
      ...gpus[0],
      id: "fixture-shared-gpu",
      memoryType: "shared",
      vramGB: null,
    };
    const result = evaluateCompatibility(specs({ gpuId: sharedGpu.id }), fixtureOfficialProfile, gtaStatus, cpus, [sharedGpu]);
    expect(component(result, "vram").status).toBe("unknown");
    expect(component(result, "vram").reasonKey).toBe("reason.vram.shared");
  });

  it("resolves every exercised component reason in every locale", () => {
    const benchmarkedCpu = { ...cpus[0], gamingScore: fixtureReference };
    const benchmarkedGpu = { ...gpus[0], rasterScore: fixtureReference, vramGB: 8 };
    const sharedGpu: (typeof gpus)[number] = {
      ...gpus[0],
      id: "fixture-shared-gpu",
      memoryType: "shared",
      vramGB: null,
    };
    const results = [
      ...profiles.map((profile) => evaluateCompatibility(specs(), profile, profile.game === "gta6" ? gtaStatus : leonidaStatus)),
      evaluateCompatibility(specs({ ramGB: 12 }), leonidaProfile, leonidaStatus),
      evaluateCompatibility(specs({ os: "linux" }), leonidaProfile, leonidaStatus),
      evaluateCompatibility(specs({ os: "macos" }), leonidaProfile, leonidaStatus),
      evaluateCompatibility(specs({ architecture: "arm64" }), leonidaProfile, leonidaStatus),
      evaluateCompatibility(specs({
        cpuId: benchmarkedCpu.id,
        gpuId: benchmarkedGpu.id,
        ramGB: 16,
        vramOverrideGB: 8,
      }), fixtureOfficialProfile, gtaStatus, [benchmarkedCpu], [benchmarkedGpu]),
      evaluateCompatibility(specs({ gpuId: sharedGpu.id }), fixtureOfficialProfile, gtaStatus, cpus, [sharedGpu]),
    ];

    for (const locale of locales) {
      const dictionary = getDictionary(locale);
      const translations = { ...dictionary.checker, ...dictionary.leonida };
      for (const result of results) {
        for (const item of result.components) {
          expect(translations[item.reasonKey], `${locale}:${item.reasonKey}`).toBeTruthy();
        }
      }
    }
  });
});
