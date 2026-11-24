import { cpus, gpus } from "@/lib/data";
import type { Architecture, DeviceType, DiskType, OperatingSystem, Resolution, UserSpecs } from "@/lib/types";
import type { CPU, GPU } from "@/lib/types";

export const STORAGE_KEY = "vi-ready-specs-v1";
export const STORAGE_SCHEMA_VERSION = 1;
export const MAX_SHARE_URL_LENGTH = 2048;

const deviceTypes: DeviceType[] = ["desktop", "laptop", "integrated", "other"];
const operatingSystems: OperatingSystem[] = ["windows10", "windows11", "linux", "macos", "other", "unknown"];
const architectures: Architecture[] = ["x64", "arm64", "other", "unknown"];
const diskTypes: DiskType[] = ["ssd", "hdd", "unknown"];
const resolutions: Resolution[] = ["1080p", "1440p", "2160p"];
export const leonidaProfiles = ["leonida-1080p-low-historical", "leonida-console-comparable-historical"] as const;
export type LeonidaProfileId = (typeof leonidaProfiles)[number];

export const emptySpecs: UserSpecs = {
  deviceType: "desktop",
  cpuId: null,
  gpuId: null,
  ramGB: null,
  vramOverrideGB: null,
  os: "unknown",
  architecture: "unknown",
  diskType: "unknown",
  freeDiskGB: null,
  resolution: "1080p",
};

function enumValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function boundedNumber(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function parseSpecs(
  search: string,
  cpus: CPU[],
  gpus: GPU[],
  profile?: LeonidaProfileId,
): { specs: UserSpecs; hasUrlState: boolean } {
  if (search.length > MAX_SHARE_URL_LENGTH) return { specs: { ...emptySpecs }, hasUrlState: false };
  const params = new URLSearchParams(search);
  const cpuId = params.get("cpu");
  const gpuId = params.get("gpu");
  const known = ["device", "cpu", "gpu", "ram", "vram", "os", "arch", "disk", "free", "resolution", "profile"].some((key) => params.has(key));
  return {
    hasUrlState: known,
    specs: {
      deviceType: enumValue(params.get("device"), deviceTypes, "desktop"),
      cpuId: cpuId && cpus.some((cpu) => cpu.id === cpuId) ? cpuId : null,
      gpuId: gpuId && gpus.some((gpu) => gpu.id === gpuId) ? gpuId : null,
      ramGB: boundedNumber(params.get("ram"), 1, 256),
      vramOverrideGB: boundedNumber(params.get("vram"), 0.5, 64),
      os: enumValue(params.get("os"), operatingSystems, "unknown"),
      architecture: enumValue(params.get("arch"), architectures, "unknown"),
      diskType: enumValue(params.get("disk"), diskTypes, "unknown"),
      freeDiskGB: boundedNumber(params.get("free"), 0, 1_000_000),
      resolution: enumValue(params.get("resolution"), resolutions, "1080p"),
      ...(profile ? {} : {}),
    },
  };
}

export function parseLeonidaProfile(value: string | null): LeonidaProfileId {
  return value && leonidaProfiles.includes(value as LeonidaProfileId)
    ? (value as LeonidaProfileId)
    : leonidaProfiles[0];
}

export function serializeSpecs(specs: UserSpecs, profile?: LeonidaProfileId): string {
  const params = new URLSearchParams();
  params.set("device", specs.deviceType);
  if (specs.cpuId) params.set("cpu", specs.cpuId);
  if (specs.gpuId) params.set("gpu", specs.gpuId);
  if (specs.ramGB !== null) params.set("ram", String(specs.ramGB));
  if (specs.vramOverrideGB !== null) params.set("vram", String(specs.vramOverrideGB));
  if (specs.os !== "unknown") params.set("os", specs.os);
  if (specs.architecture !== "unknown") params.set("arch", specs.architecture);
  if (specs.diskType !== "unknown") params.set("disk", specs.diskType);
  if (specs.freeDiskGB !== null) params.set("free", String(specs.freeDiskGB));
  if (specs.resolution !== "1080p") params.set("resolution", specs.resolution);
  if (profile) params.set("profile", profile);
  const query = params.toString();
  return query.length <= MAX_SHARE_URL_LENGTH ? query : "";
}

export function readSavedSpecs(): UserSpecs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as { schemaVersion?: unknown; specs?: unknown };
    if (record.schemaVersion !== STORAGE_SCHEMA_VERSION || !record.specs) return null;
    const url = new URLSearchParams(serializeSpecs(record.specs as UserSpecs));
    return parseSpecs(`?${url.toString()}`, cpus, gpus).specs;
  } catch {
    return null;
  }
}

export function saveSpecs(specs: UserSpecs): void {
  try {
    const safe = parseSpecs(`?${serializeSpecs(specs)}`, cpus, gpus).specs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: STORAGE_SCHEMA_VERSION, specs: safe }));
  } catch {
    return;
  }
}

export function clearSavedSpecs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
