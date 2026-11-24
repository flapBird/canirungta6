import { matchRenderer, normalizeHardware } from "@/lib/hardware-matcher";
import type { CPU, GPU } from "@/lib/types";

export const MAX_DXDIAG_BYTES = 2 * 1024 * 1024;

export interface DxDiagReport {
  cpuNames: string[];
  gpuNames: string[];
  memoryGB: number | null;
}

const cpuLabels = new Set(["processor name", "nombre del procesador", "اسم المعالج"]);
const memoryLabels = new Set(["memory", "memoria", "الذاكرة"]);
const gpuNameLabels = new Set(["name", "nombre", "الاسم"]);
const displaySections = ["display devices", "dispositivos de visualizacion", "أجهزة العرض"];

function normalizeLabel(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f\u064b-\u065f]/g, "").replace(/[:：]/g, "").replace(/\s+/g, " ").trim();
}

function cleanName(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
}

function uniqueNames(values: string[]): string[] {
  return [...new Set(values.map(cleanName).filter(Boolean))];
}

function parseMemory(value: string): number | null {
  const match = value.replace(/(\d),(\d)/g, "$1.$2").match(/(\d+(?:\.\d+)?)\s*(GiB|GB|MiB|MB)\b/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const memory = /MiB|MB/i.test(match[2]) ? amount / 1024 : amount;
  return Number.isFinite(memory) && memory > 0 && memory <= 1024 ? Math.round(memory * 10) / 10 : null;
}

export function decodeDxDiag(bytes: Uint8Array): string {
  if (bytes.byteLength > MAX_DXDIAG_BYTES) throw new Error("DXDIAG_TOO_LARGE");
  try {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      const swapped = new Uint8Array(bytes.byteLength);
      for (let index = 0; index < bytes.byteLength; index += 2) {
        swapped[index] = bytes[index + 1];
        swapped[index + 1] = bytes[index];
      }
      return new TextDecoder("utf-16le").decode(swapped);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("DXDIAG_ENCODING");
  }
}

export function parseDxDiag(text: string): DxDiagReport {
  if (text.length > MAX_DXDIAG_BYTES) throw new Error("DXDIAG_TOO_LARGE");
  const lines = text.split(/\r?\n/);
  const sectionTitles = lines.flatMap((line, index) => {
    if (index === 0 || index === lines.length - 1 || !line.trim()) return [];
    if (!/^-{3,}\s*$/.test(lines[index - 1]) || !/^-{3,}\s*$/.test(lines[index + 1])) return [];
    return [{ index, title: normalizeLabel(line) }];
  });

  const cpuNames: string[] = [];
  const gpuNames: string[] = [];
  let memoryGB: number | null = null;

  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon < 1) continue;
    const label = normalizeLabel(line.slice(0, colon));
    const value = line.slice(colon + 1).trim();
    if (cpuLabels.has(label)) cpuNames.push(value);
    if (memoryLabels.has(label)) memoryGB = parseMemory(value) ?? memoryGB;
  }

  for (const [sectionIndex, section] of sectionTitles.entries()) {
    if (!displaySections.some((title) => section.title.includes(normalizeLabel(title)))) continue;
    const end = sectionTitles[sectionIndex + 1]?.index ?? lines.length;
    for (const line of lines.slice(section.index + 2, end)) {
      const colon = line.indexOf(":");
      if (colon < 1) continue;
      if (gpuNameLabels.has(normalizeLabel(line.slice(0, colon)))) gpuNames.push(line.slice(colon + 1).trim());
    }
  }

  return { cpuNames: uniqueNames(cpuNames), gpuNames: uniqueNames(gpuNames), memoryGB };
}

function comparableName(value: string): string {
  return normalizeHardware(value
    .replace(/\((r|tm|c)\)/gi, " ")
    .replace(/\b(?:cpu|processor)\b/gi, " ")
    .replace(/\b\d+-core\b/gi, " ")
    .replace(/@\s*\d+(?:\.\d+)?\s*ghz\b/gi, " "));
}

export function matchDxDiagCpu(name: string, cpus: CPU[]): CPU | null {
  const normalized = comparableName(name);
  const matches = cpus.filter((cpu) => [cpu.name, ...cpu.aliases].some((candidate) => comparableName(candidate) === normalized));
  return matches.length === 1 ? matches[0] : null;
}

export function matchDxDiagGpus(names: string[], gpus: GPU[]): GPU[] {
  const matches = names.map((name) => matchRenderer(name, gpus)).filter((gpu): gpu is GPU => gpu !== null);
  return [...new Map(matches.map((gpu) => [gpu.id, gpu])).values()];
}
