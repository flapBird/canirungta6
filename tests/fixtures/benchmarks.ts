import type { BenchmarkValue, RequirementProfile } from "../../src/lib/types";
import { profiles } from "../../src/lib/data";

export const fixtureReference: BenchmarkValue = {
  value: 100,
  datasetId: "fixture-only-dataset",
  sourceId: "fixture-only-source",
  measuredAt: "2026-11-24",
};

export const fixtureDifferentDataset: BenchmarkValue = {
  ...fixtureReference,
  datasetId: "other-fixture-dataset",
};

export const fixtureOfficialProfile: RequirementProfile = {
  ...profiles[0],
  id: "fixture-official-profile",
  evidenceKind: "official",
  confidence: "medium",
  referenceCpuIds: [],
  referenceGpuIds: [],
  cpuTarget: fixtureReference,
  gpuTarget: fixtureReference,
  ramGB: 16,
  vramGB: 8,
  requiredOs: ["windows10", "windows11"],
  requiredArchitecture: ["x64"],
  sourceIds: ["fixture-only-source"],
};
