import type { CPU, GPU } from "@/lib/types";

export interface HardwareOption {
  id: string;
  name: string;
  aliases: string[];
  deviceType: string;
  detail: string;
}

export function normalizeHardware(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/geforce|radeon|amd|intel|nvidia|processor|graphics|card|gpu|cpu/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function searchHardware<T extends CPU | GPU>(items: T[], query: string): T[] {
  const normalized = normalizeHardware(query);
  if (!normalized) return items;
  return items
    .map((item) => {
      const name = normalizeHardware(item.name);
      const aliases = item.aliases.map(normalizeHardware);
      const exact = name === normalized || aliases.includes(normalized);
      const starts = name.startsWith(normalized) || aliases.some((alias) => alias.startsWith(normalized));
      const contains = name.includes(normalized) || aliases.some((alias) => alias.includes(normalized));
      return { item, score: exact ? 3 : starts ? 2 : contains ? 1 : 0 };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map(({ item }) => item);
}

export function matchRenderer(renderer: string, gpus: GPU[]): GPU | null {
  const normalized = normalizeHardware(renderer);
  if (/swiftshader|llvmpipe|software|mesa offscreen|microsoft basic/.test(normalized)) return null;
  const candidates = searchHardware(gpus, renderer)
    .filter((gpu) => {
      const searchable = normalizeHardware(`${gpu.name} ${gpu.aliases.join(" ")}`);
      return searchable.includes(normalized) || normalized.includes(searchable) || searchable.split(" ").every((part) => normalized.includes(part));
    })
    .filter((gpu) => {
      const family = normalizeHardware(gpu.name).replace(/\b(8gb|12gb|16gb|laptop)\b/g, "").trim();
      return normalized.includes(family);
    });

  const laptop = /laptop|mobile|max q/.test(normalized);
  const variant = candidates.filter((gpu) => (gpu.deviceType === "laptop") === laptop);
  const memoryMatch = /12\s*gb/.test(normalized)
    ? variant.filter((gpu) => gpu.vramGB === 12)
    : /8\s*gb/.test(normalized)
      ? variant.filter((gpu) => gpu.vramGB === 8)
      : variant;
  const uniqueFamilies = new Set(memoryMatch.map((gpu) => normalizeHardware(gpu.name).replace(/\b(8gb|12gb|16gb|laptop)\b/g, "").trim()));
  if (uniqueFamilies.size !== 1 || memoryMatch.length !== 1) return null;
  return memoryMatch[0];
}
