"use client";

import { useState } from "react";
import { cpus, gpus } from "@/lib/data";
import { evaluateCompatibility } from "@/lib/compatibility-engine";
import type { CompatibilityResult, Dictionary, RequirementProfile, UserSpecs, GameStatus } from "@/lib/types";
import { HardwareCombobox } from "./HardwareCombobox";

interface UpgradeSimulatorProps {
  dictionary: Dictionary;
  profile: RequirementProfile;
  status: GameStatus;
  baselineSpecs: UserSpecs;
  baselineResult: CompatibilityResult;
}

const ramOptions = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export function UpgradeSimulator({ dictionary, profile, status, baselineSpecs, baselineResult }: UpgradeSimulatorProps) {
  const t = dictionary.checker;
  const c = dictionary.common;
  const [candidateSpecs, setCandidateSpecs] = useState<UserSpecs>({ ...baselineSpecs });
  const [candidateResult, setCandidateResult] = useState<CompatibilityResult | null>(null);
  const options = [...new Set([...ramOptions, ...(baselineSpecs.ramGB === null ? [] : [baselineSpecs.ramGB])])].sort((a, b) => a - b);
  const translate = (key: string) => c[key] ?? t[key] ?? key;
  const resultLabel = (result: CompatibilityResult) => result.tier === "unknown" ? c.unknownTier : translate(result.tier);
  const confidenceLabel = (result: CompatibilityResult) => result.confidence === "unknown" ? c.unknownConfidence : translate(result.confidence);
  const valueLabel = (key: "cpu" | "gpu" | "ram", specs: UserSpecs) => {
    if (key === "cpu") return cpus.find((cpu) => cpu.id === specs.cpuId)?.name ?? c.unknown;
    if (key === "gpu") return gpus.find((gpu) => gpu.id === specs.gpuId)?.name ?? c.unknown;
    return specs.ramGB === null ? c.unknown : `${specs.ramGB} GB`;
  };
  const component = (result: CompatibilityResult, key: "cpu" | "gpu" | "ram") => result.components.find((item) => item.key === key)!;

  const update = (patch: Partial<UserSpecs>) => {
    setCandidateSpecs((current) => ({ ...current, ...patch }));
    setCandidateResult(null);
  };

  const reset = () => {
    setCandidateSpecs({ ...baselineSpecs });
    setCandidateResult(null);
  };

  return (
    <section className="panel mt-6 p-5 sm:p-6" aria-labelledby="upgrade-simulator-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t.simulatorEyebrow}</p>
          <h2 id="upgrade-simulator-title" className="mt-1 text-2xl font-extrabold">{t.simulatorTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">{t.simulatorBody}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={reset}>{t.simulatorReset}</button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <HardwareCombobox id="simulator-cpu" label={t.simulatorCpu} placeholder={t.searchCpu} items={cpus} value={candidateSpecs.cpuId} onChange={(cpuId) => update({ cpuId })} dictionary={dictionary} />
        <HardwareCombobox id="simulator-gpu" label={t.simulatorGpu} placeholder={t.searchGpu} items={gpus} value={candidateSpecs.gpuId} onChange={(gpuId) => update({ gpuId, vramOverrideGB: null })} dictionary={dictionary} />
        <div>
          <label htmlFor="simulator-ram" className="field-label">{t.simulatorRam}</label>
          <select id="simulator-ram" className="field" value={candidateSpecs.ramGB === null ? "unknown" : String(candidateSpecs.ramGB)} onChange={(event) => update({ ramGB: event.target.value === "unknown" ? null : Number(event.target.value) })}>
            <option value="unknown">{t.chooseUnknown}</option>
            {options.map((ram) => <option key={ram} value={ram}>{ram} GB</option>)}
          </select>
        </div>
      </div>
      <button type="button" className="btn-primary mt-4" onClick={() => setCandidateResult(evaluateCompatibility(candidateSpecs, profile, status))}>{t.simulatorRun}</button>
      <p className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-muted">{t.simulatorPhysical}</p>

      {candidateResult && (
        <div className="mt-5 border-t border-border pt-5" aria-live="polite">
          <h3 className="text-lg font-extrabold">{t.simulatorResultTitle}</h3>
          <p className="mt-1 text-sm text-muted">{t.simulatorSameProfile}: <bdi dir="ltr">{candidateResult.profileId} · {candidateResult.profileVersion}</bdi></p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-start text-sm">
              <caption className="sr-only">{t.simulatorComparison}</caption>
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="p-2 text-start">{t.component}</th>
                  <th className="p-2 text-start">{t.simulatorBefore}</th>
                  <th className="p-2 text-start">{t.simulatorAfter}</th>
                </tr>
              </thead>
              <tbody>
                {(["cpu", "gpu", "ram"] as const).map((key) => {
                  const before = component(baselineResult, key);
                  const after = component(candidateResult, key);
                  return (
                    <tr key={key} className="border-b border-border/60 align-top">
                      <th className="p-2 text-start font-bold">{translate(key)}</th>
                      <td className="p-2"><bdi dir="ltr">{valueLabel(key, baselineSpecs)}</bdi><span className={`mt-1 block text-xs font-bold status-${before.status}`}>{translate(before.status)}</span></td>
                      <td className="p-2"><bdi dir="ltr">{valueLabel(key, candidateSpecs)}</bdi><span className={`mt-1 block text-xs font-bold status-${after.status}`}>{translate(after.status)}</span><span className="mt-1 block text-xs text-muted">{translate(after.reasonKey)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-xs"><span className="block text-muted">{t.simulatorBefore}</span><strong>{resultLabel(baselineResult)}</strong></div>
            <div className="rounded-lg border border-border p-3 text-xs"><span className="block text-muted">{t.simulatorAfter}</span><strong>{resultLabel(candidateResult)}</strong></div>
            <div className="rounded-lg border border-border p-3 text-xs"><span className="block text-muted">{t.confidence}</span><strong>{confidenceLabel(candidateResult)}</strong></div>
          </div>
          <p className="mt-3 text-sm font-bold text-warning">{t.simulatorNoFps}</p>
          {candidateResult.limitations.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted">
              {candidateResult.limitations.map((key) => <li key={key}>{t[key] ?? dictionary.leonida[key] ?? key}</li>)}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted">{candidateResult.missingFields.length ? `${t.simulatorMissing}: ${candidateResult.missingFields.map((key) => translate(key)).join(", ")}` : t.simulatorNoMissing}</p>
        </div>
      )}
    </section>
  );
}
