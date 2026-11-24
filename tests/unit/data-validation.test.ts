import { describe, expect, it } from "vitest";
import { loadDataset, validateDataset } from "../../scripts/validate-data.mjs";

describe("dataset validation", () => {
  it("accepts the checked-in production dataset", () => {
    expect(validateDataset(loadDataset())).toEqual([]);
  });

  it("rejects duplicate hardware IDs with a clear error", () => {
    const dataset = loadDataset();
    dataset.cpus[1].id = dataset.cpus[0].id;
    expect(validateDataset(dataset).join("\n")).toContain("CPU: duplicate or empty id");
  });

  it("rejects missing and unknown evidence sources", () => {
    const missing = loadDataset();
    missing.gpus[0].sourceIds = [];
    expect(validateDataset(missing).join("\n")).toContain("missing sourceIds");

    const unknown = loadDataset();
    unknown.cpus[0].sourceIds = ["not-registered"];
    expect(validateDataset(unknown).join("\n")).toContain("unknown source not-registered");
  });

  it("rejects invalid numeric values and zero benchmark denominators", () => {
    const invalid = loadDataset();
    invalid.gpus[0].vramGB = 0;
    expect(validateDataset(invalid).join("\n")).toContain("invalid vramGB");

    const benchmark = loadDataset();
    benchmark.cpus[0].gamingScore = {
      value: 0,
      datasetId: "fixture-only-dataset",
      sourceId: benchmark.sources[0].id,
      measuredAt: "2026-11-24",
    };
    expect(validateDataset(benchmark).join("\n")).toContain("invalid benchmark value");
  });

  it("rejects duplicate game statuses and stale source metadata mistakes", () => {
    const dataset = loadDataset();
    dataset.statuses[1].game = dataset.statuses[0].game;
    expect(validateDataset(dataset).join("\n")).toContain("status: duplicate or empty game");

    const source = loadDataset();
    source.sources[0].url = "http://insecure.example";
    expect(validateDataset(source).join("\n")).toContain("URL must use HTTPS");
  });
});
