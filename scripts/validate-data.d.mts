import type { CPU, Evidence, GPU, GameStatus, RequirementProfile } from "../src/lib/types";

export interface ValidationDataset {
  sources: Evidence[];
  cpus: CPU[];
  gpus: GPU[];
  profiles: RequirementProfile[];
  statuses: GameStatus[];
  guides: typeof import("../src/data/guides.json");
  routes: typeof import("../src/data/routes.json");
}

export function loadDataset(): ValidationDataset;
export function validateDataset(dataset: ValidationDataset): string[];
