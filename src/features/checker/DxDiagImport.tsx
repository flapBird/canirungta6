"use client";

import { useRef, useState } from "react";
import { cpus, gpus } from "@/lib/data";
import { decodeDxDiag, matchDxDiagCpu, matchDxDiagGpus, MAX_DXDIAG_BYTES, parseDxDiag, type DxDiagReport } from "@/lib/dxdiag-parser";
import type { Dictionary, UserSpecs } from "@/lib/types";

interface DxDiagImportProps {
  dictionary: Dictionary;
  onApply: (specs: Partial<UserSpecs>) => void;
}

export function DxDiagImport({ dictionary, onApply }: DxDiagImportProps) {
  const t = dictionary.checker;
  const inputRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<DxDiagReport | null>(null);
  const [cpuId, setCpuId] = useState<string | null>(null);
  const [gpuMatches, setGpuMatches] = useState<typeof gpus>([]);
  const [gpuId, setGpuId] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const readFile = async (file: File) => {
    setReading(true);
    setError(null);
    setApplied(false);
    try {
      if (file.size > MAX_DXDIAG_BYTES) throw new Error("DXDIAG_TOO_LARGE");
      const parsed = parseDxDiag(decodeDxDiag(new Uint8Array(await file.arrayBuffer())));
      if (!parsed.cpuNames.length && !parsed.gpuNames.length && parsed.memoryGB === null) throw new Error("DXDIAG_NO_DATA");
      const cpu = parsed.cpuNames.length ? matchDxDiagCpu(parsed.cpuNames[0], cpus) : null;
      const matchedGpus = matchDxDiagGpus(parsed.gpuNames, gpus);
      setReport(parsed);
      setCpuId(cpu?.id ?? null);
      setGpuMatches(matchedGpus);
      setGpuId(matchedGpus.length === 1 ? matchedGpus[0].id : null);
    } catch (cause) {
      setReport(null);
      setCpuId(null);
      setGpuMatches([]);
      setGpuId(null);
      const code = cause instanceof Error ? cause.message : "";
      setError(code === "DXDIAG_TOO_LARGE" ? t.dxdiagTooLarge : code === "DXDIAG_ENCODING" ? t.dxdiagEncoding : t.dxdiagNoData);
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const apply = () => {
    if (!report) return;
    onApply({
      ...(cpuId ? { cpuId } : {}),
      ...(gpuId ? { gpuId, vramOverrideGB: null } : {}),
      ...(report.memoryGB !== null ? { ramGB: report.memoryGB } : {}),
    });
    setApplied(true);
  };

  return (
    <div className="mt-4 rounded-xl border border-border bg-black/10 p-3">
      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        className="sr-only"
        aria-label={t.dxdiagChoose}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void readFile(file);
        }}
      />
      <button type="button" className="btn-secondary w-full" onClick={() => inputRef.current?.click()} disabled={reading}>
        {reading ? t.dxdiagParsing : t.dxdiagChoose}
      </button>
      <p className="mt-2 text-xs text-muted">{t.dxdiagHelp}</p>
      <p className="mt-1 text-xs text-muted">{t.dxdiagPrivacy}</p>
      {error && <p role="alert" className="mt-2 text-sm font-bold text-danger">{error}</p>}
      {report && (
        <div className="mt-3 space-y-2 border-t border-border pt-3" role="status">
          <p className="text-sm font-bold">{t.dxdiagFound}</p>
          <p className="text-xs text-muted">{t.dxdiagCpu}: <bdi dir="ltr">{cpus.find((cpu) => cpu.id === cpuId)?.name ?? t.dxdiagUnmatched}</bdi></p>
          {gpuMatches.length > 1 && (
            <select className="field" value={gpuId ?? ""} onChange={(event) => setGpuId(event.target.value || null)} aria-label={t.dxdiagSelectGpu}>
              <option value="">{t.dxdiagSelectGpu}</option>
              {gpuMatches.map((gpu) => <option key={gpu.id} value={gpu.id}>{gpu.name}</option>)}
            </select>
          )}
          <p className="text-xs text-muted">{t.dxdiagGpu}: <bdi dir="ltr">{gpus.find((gpu) => gpu.id === gpuId)?.name ?? t.dxdiagUnmatched}</bdi></p>
          <p className="text-xs text-muted">{t.dxdiagMemory}: {report.memoryGB === null ? t.chooseUnknown : `${report.memoryGB} GB`}</p>
          <button type="button" className="btn-primary w-full" onClick={apply}>{t.dxdiagApply}</button>
          {applied && <p className="text-xs font-bold text-success">{t.dxdiagApplied}</p>}
        </div>
      )}
    </div>
  );
}
