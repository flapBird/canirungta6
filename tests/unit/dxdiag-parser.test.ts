import { describe, expect, it } from "vitest";
import { cpus, gpus } from "@/lib/data";
import { decodeDxDiag, matchDxDiagCpu, matchDxDiagGpus, MAX_DXDIAG_BYTES, parseDxDiag } from "@/lib/dxdiag-parser";

function report(cpu: string, gpus: string[], memory: string) {
  return [
    "------------------",
    "System Information",
    "------------------",
    "Machine Name: SECRET-MACHINE",
    "Serial Number: SECRET-SERIAL",
    `Processor name: ${cpu}`,
    `Memory: ${memory}`,
    "------------------",
    "Display Devices",
    "------------------",
    ...gpus.flatMap((gpu, index) => [`Card ${index + 1}:`, `   Name: ${gpu}`]),
  ].join("\r\n");
}

describe("DxDiag local parser", () => {
  it("extracts only approved hardware fields from UTF-8 text", () => {
    const parsed = parseDxDiag(report("Intel(R) Core(TM) i5-12400F CPU @ 2.50GHz", ["NVIDIA GeForce RTX 3060 12GB"], "16384MB RAM"));
    expect(parsed).toEqual({ cpuNames: ["Intel(R) Core(TM) i5-12400F CPU @ 2.50GHz"], gpuNames: ["NVIDIA GeForce RTX 3060 12GB"], memoryGB: 16 });
    expect(JSON.stringify(parsed)).not.toContain("SECRET");
  });

  it("supports localized Spanish labels and decimal memory", () => {
    const text = [
      "------------------", "Información del sistema", "------------------",
      "Nombre del procesador: AMD Ryzen 7 3700X 8-Core Processor", "Memoria: 32 GB RAM",
      "------------------", "Dispositivos de visualización", "------------------", "Nombre: NVIDIA GeForce RTX 3070",
    ].join("\n");
    expect(parseDxDiag(text)).toEqual({ cpuNames: ["AMD Ryzen 7 3700X 8-Core Processor"], gpuNames: ["NVIDIA GeForce RTX 3070"], memoryGB: 32 });
  });

  it("decodes UTF-16LE with Arabic labels", () => {
    const text = [
      "------------------", "معلومات النظام", "------------------",
      "اسم المعالج: Intel Core i5-12400F", "الذاكرة: 16GB RAM",
      "------------------", "أجهزة العرض", "------------------", "الاسم: NVIDIA GeForce RTX 3060 12GB",
    ].join("\n");
    const bytes = new Uint8Array(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]));
    expect(parseDxDiag(decodeDxDiag(bytes))).toEqual({ cpuNames: ["Intel Core i5-12400F"], gpuNames: ["NVIDIA GeForce RTX 3060 12GB"], memoryGB: 16 });
  });

  it("decodes UTF-16BE byte order marks", () => {
    const littleEndian = Buffer.from("Processor name: AMD Ryzen 5 5600", "utf16le");
    const bytes = new Uint8Array(littleEndian.length + 2);
    bytes[0] = 0xfe;
    bytes[1] = 0xff;
    for (let index = 0; index < littleEndian.length; index += 2) {
      bytes[index + 2] = littleEndian[index + 1];
      bytes[index + 3] = littleEndian[index];
    }
    expect(parseDxDiag(decodeDxDiag(bytes)).cpuNames).toEqual(["AMD Ryzen 5 5600"]);
  });

  it("keeps multiple GPUs available without choosing one implicitly", () => {
    const names = ["NVIDIA GeForce RTX 3060 12GB", "Intel UHD Graphics 770", "NVIDIA GeForce RTX 3060 12GB"];
    const parsed = parseDxDiag(report("AMD Ryzen 5 5600", names, "16 GB"));
    expect(parsed.gpuNames).toHaveLength(2);
    expect(matchDxDiagGpus(parsed.gpuNames, gpus).map((gpu) => gpu.id)).toEqual(["nvidia-rtx-3060-12gb-desktop"]);
  });

  it("matches exact CPU aliases after removing trademark and frequency noise", () => {
    expect(matchDxDiagCpu("Intel(R) Core(TM) i5-12400F CPU @ 2.50GHz", cpus)?.id).toBe("intel-core-i5-12400f");
    expect(matchDxDiagCpu("AMD Ryzen 5 5600 6-Core Processor", cpus)?.id).toBe("amd-ryzen-5-5600");
    expect(matchDxDiagCpu("Intel Core i5-12400", cpus)).toBeNull();
  });

  it("rejects ambiguous GPU variants instead of guessing VRAM", () => {
    expect(matchDxDiagGpus(["NVIDIA GeForce RTX 3060"], gpus)).toEqual([]);
  });

  it("enforces the size limit and rejects invalid encodings", () => {
    expect(() => decodeDxDiag(new Uint8Array(MAX_DXDIAG_BYTES + 1))).toThrow("DXDIAG_TOO_LARGE");
    expect(() => decodeDxDiag(new Uint8Array([0xff, 0xff, 0xff]))).toThrow("DXDIAG_ENCODING");
  });

  it("returns empty approved fields for unrelated text", () => {
    expect(parseDxDiag("Machine name: SECRET\nSerial: SECRET")).toEqual({ cpuNames: [], gpuNames: [], memoryGB: null });
  });
});
