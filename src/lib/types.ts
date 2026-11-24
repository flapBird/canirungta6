export type Locale = "en" | "es" | "ar";
export type GameId = "gta6" | "leonida";
export type DeviceType = "desktop" | "laptop" | "integrated" | "other";
export type Availability = "unannounced" | "not-verified-playable" | "verified-playable" | "unknown";
export type Tier = "unlikely" | "borderline" | "likely" | "strong" | "unknown";
export type ComponentStatus = "meets" | "below" | "near" | "unknown" | "not-applicable";
export type Confidence = "low" | "medium" | "high" | "unknown";
export type Resolution = "1080p" | "1440p" | "2160p";
export type OperatingSystem = "windows10" | "windows11" | "linux" | "macos" | "other" | "unknown";
export type Architecture = "x64" | "arm64" | "other" | "unknown";
export type DiskType = "ssd" | "hdd" | "unknown";

export interface Evidence {
  id: string;
  url: string;
  publisher: string;
  title: string;
  kind: "official" | "community" | "licensed-benchmark" | "self-test" | "forecast" | "secondary" | "upstream";
  checkedAt: string;
  accessible: boolean;
  stale: boolean;
  license: string | null;
  notes?: string;
}

export interface BenchmarkValue {
  value: number;
  datasetId: string;
  sourceId: string;
  measuredAt: string;
}

export interface GPU {
  id: string;
  name: string;
  brand: "NVIDIA" | "AMD" | "Intel" | "Apple" | "Other";
  deviceType: DeviceType;
  architecture: string | null;
  releaseYear: number | null;
  vramGB: number | null;
  memoryType: "dedicated" | "shared" | "unknown";
  rasterScore: BenchmarkValue | null;
  rayTracingScore: BenchmarkValue | null;
  vulkanVersion: string | null;
  directXFeatureLevel: string | null;
  tgpMin: number | null;
  tgpMax: number | null;
  aliases: string[];
  sourceIds: string[];
  updatedAt: string;
}

export interface CPU {
  id: string;
  name: string;
  brand: "Intel" | "AMD" | "Apple" | "Other";
  deviceType: DeviceType;
  architecture: string | null;
  instructionSet: Architecture;
  releaseYear: number | null;
  cores: number | null;
  threads: number | null;
  singleCoreScore: BenchmarkValue | null;
  multiCoreScore: BenchmarkValue | null;
  gamingScore: BenchmarkValue | null;
  aliases: string[];
  sourceIds: string[];
  updatedAt: string;
}

export interface UserSpecs {
  deviceType: DeviceType;
  cpuId: string | null;
  gpuId: string | null;
  ramGB: number | null;
  vramOverrideGB: number | null;
  os: OperatingSystem;
  architecture: Architecture;
  diskType: DiskType;
  freeDiskGB: number | null;
  resolution: Resolution;
}

export interface RequirementProfile {
  id: string;
  game: GameId;
  version: string;
  evidenceKind: "forecast" | "historical-community" | "official";
  referenceCpuIds: string[];
  referenceGpuIds: string[];
  cpuMetric: "gamingScore";
  gpuMetric: "rasterScore";
  cpuTarget: BenchmarkValue | null;
  gpuTarget: BenchmarkValue | null;
  ramGB: number | null;
  vramGB: number | null;
  requiredOs: OperatingSystem[];
  requiredArchitecture: Architecture[];
  storageReferenceGB: number | null;
  storageStage: "runtime" | "full-build" | "game-install" | null;
  resolution: Resolution | "unknown";
  sourceIds: string[];
  reviewedAt: string;
  confidence: Confidence;
  stale: boolean;
}

export interface ComponentResult {
  key: "cpu" | "gpu" | "ram" | "vram" | "os" | "architecture" | "storage" | "vulkan";
  status: ComponentStatus;
  ratio: number | null;
  sourceIds: string[];
  reasonKey: string;
}

export interface CompatibilityResult {
  game: GameId;
  profileId: string;
  profileVersion: string;
  availability: Availability;
  tier: Tier;
  confidence: Confidence;
  components: ComponentResult[];
  limitations: string[];
  missingFields: string[];
  estimatedFps: null;
}

export interface GameStatus {
  game: GameId;
  availability: Availability;
  upstreamRepository: "accessible" | "inaccessible" | "access-unconfirmed";
  checkedAt: string;
  stale: boolean;
  sourceIds: string[];
  notesKey: string;
}

export interface Dictionary {
  localeName: string;
  direction: "ltr" | "rtl";
  nav: { checker: string; leonida: string; requirements: string; status: string; guides: string };
  common: Record<string, string>;
  guides: Record<string, string>;
  checker: Record<string, string>;
  leonida: Record<string, string>;
  requirements: Record<string, string>;
  status: Record<string, string>;
  support: Record<string, string>;
  seo: Record<string, { title: string; description: string }>;
  faq: { question: string; answer: string }[];
}
