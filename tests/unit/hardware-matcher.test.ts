import { describe, expect, it } from "vitest";
import { cpus, gpus } from "@/lib/data";
import { matchRenderer, normalizeHardware, searchHardware } from "@/lib/hardware-matcher";

describe("hardware search", () => {
  it("normalizes brands, punctuation, accents, and repeated spaces", () => {
    expect(normalizeHardware("  NVIDIA GeForce RTX-3060 12GB  ")).toBe("rtx 3060 12gb");
    expect(normalizeHardware("Amd Radeon RX 6700 XT")).toBe("rx 6700 xt");
  });

  it("returns separate RTX 3060 8GB, 12GB, and Laptop variants", () => {
    const matches = searchHardware(gpus, "3060");
    expect(matches.map((gpu) => gpu.id)).toEqual(expect.arrayContaining([
      "nvidia-rtx-3060-8gb-desktop",
      "nvidia-rtx-3060-12gb-desktop",
      "nvidia-rtx-3060-laptop",
    ]));
  });

  it("ranks exact aliases and allows CPU model lookup", () => {
    expect(searchHardware(gpus, "RTX 3060 12GB")[0].id).toBe("nvidia-rtx-3060-12gb-desktop");
    expect(searchHardware(cpus, "12400F")[0].id).toBe("intel-core-i5-12400f");
    expect(searchHardware(gpus, "not-a-real-model")).toEqual([]);
  });
});

describe("renderer matching", () => {
  it("rejects software and masked renderers", () => {
    expect(matchRenderer("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))", gpus)).toBeNull();
    expect(matchRenderer("llvmpipe (LLVM 15.0.6, 256 bits)", gpus)).toBeNull();
    expect(matchRenderer("Microsoft Basic Render Driver", gpus)).toBeNull();
  });

  it("does not guess an ambiguous RTX 3060 variant", () => {
    expect(matchRenderer("NVIDIA GeForce RTX 3060", gpus)).toBeNull();
  });

  it("matches an explicit desktop or laptop variant", () => {
    expect(matchRenderer("NVIDIA GeForce RTX 3060 12GB", gpus)?.id).toBe("nvidia-rtx-3060-12gb-desktop");
    expect(matchRenderer("NVIDIA GeForce RTX 3060 Laptop GPU", gpus)?.id).toBe("nvidia-rtx-3060-laptop");
  });
});

describe("production evidence", () => {
  it("contains no fabricated performance benchmark values", () => {
    for (const cpu of cpus) {
      expect(cpu.gamingScore).toBeNull();
      expect(cpu.singleCoreScore).toBeNull();
      expect(cpu.multiCoreScore).toBeNull();
    }
    for (const gpu of gpus) {
      expect(gpu.rasterScore).toBeNull();
      expect(gpu.rayTracingScore).toBeNull();
    }
  });
});
