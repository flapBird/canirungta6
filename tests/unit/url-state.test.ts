import { describe, expect, it } from "vitest";
import { cpus, gpus } from "@/lib/data";
import {
  MAX_SHARE_URL_LENGTH,
  emptySpecs,
  leonidaProfiles,
  parseLeonidaProfile,
  parseSpecs,
  serializeSpecs,
} from "@/lib/url-state";

describe("URL state", () => {
  it("starts with no fake detection result", () => {
    expect(parseSpecs("", cpus, gpus)).toEqual({ specs: emptySpecs, hasUrlState: false });
  });

  it("round-trips only known hardware IDs and whitelisted values", () => {
    const specs = {
      ...emptySpecs,
      deviceType: "laptop" as const,
      cpuId: "intel-core-i5-12400f",
      gpuId: "nvidia-rtx-3060-laptop",
      ramGB: 32,
      vramOverrideGB: 6,
      os: "windows11" as const,
      architecture: "x64" as const,
      diskType: "ssd" as const,
      freeDiskGB: 250,
      resolution: "1440p" as const,
    };
    const query = serializeSpecs(specs, leonidaProfiles[1]);
    expect(parseSpecs(`?${query}`, cpus, gpus).specs).toEqual(specs);
    expect(query).toContain(`profile=${leonidaProfiles[1]}`);
    expect(query).not.toContain("renderer");
    expect(query).not.toContain("machine");
  });

  it("safely falls back for unknown IDs, invalid enums, and out-of-range values", () => {
    const parsed = parseSpecs("?cpu=<script>&gpu=unknown&device=hacker&ram=9999&vram=-4&free=Infinity&os=plan9&arch=x86&disk=tape&resolution=8k", cpus, gpus);
    expect(parsed.specs).toEqual(emptySpecs);
  });

  it("ignores unapproved parameters and oversized URLs", () => {
    expect(parseSpecs("?renderer=ANGLE&serial=secret", cpus, gpus).hasUrlState).toBe(false);
    expect(parseSpecs(`?cpu=${"a".repeat(MAX_SHARE_URL_LENGTH)}`, cpus, gpus)).toEqual({ specs: emptySpecs, hasUrlState: false });
  });

  it("accepts only registered Leonida profiles", () => {
    expect(parseLeonidaProfile(leonidaProfiles[1])).toBe(leonidaProfiles[1]);
    expect(parseLeonidaProfile("leonida-official")).toBe(leonidaProfiles[0]);
    expect(parseLeonidaProfile(null)).toBe(leonidaProfiles[0]);
  });
});
