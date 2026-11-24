import cpuData from "@/data/cpus.json";
import gpuData from "@/data/gpus.json";
import sourceData from "@/data/sources.json";
import gtaProfile from "@/data/profiles/gta6.json";
import leonidaLowProfile from "@/data/profiles/leonida-low.json";
import leonidaHighProfile from "@/data/profiles/leonida-high.json";
import gtaStatus from "@/data/status/gta6.json";
import leonidaStatus from "@/data/status/leonida.json";
import type { CPU, Evidence, GPU, GameStatus, RequirementProfile } from "@/lib/types";

export const cpus = cpuData as CPU[];
export const gpus = gpuData as GPU[];
export const sources = sourceData as Evidence[];
export const profiles: RequirementProfile[] = [gtaProfile, leonidaLowProfile, leonidaHighProfile] as RequirementProfile[];
export const gameStatuses: GameStatus[] = [gtaStatus, leonidaStatus] as GameStatus[];
export const hardwareCoverage = {
  cpus: cpus.length,
  gpus: gpus.length,
  desktopCpus: cpus.filter((cpu) => cpu.deviceType === "desktop").length,
  laptopCpus: cpus.filter((cpu) => cpu.deviceType === "laptop").length,
  desktopGpus: gpus.filter((gpu) => gpu.deviceType === "desktop").length,
  laptopGpus: gpus.filter((gpu) => gpu.deviceType === "laptop").length,
  integratedGpus: gpus.filter((gpu) => gpu.deviceType === "integrated").length,
};
