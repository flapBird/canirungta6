"use client";

import { forwardRef } from "react";
import { cpus, gpus } from "@/lib/data";
import type { CompatibilityResult, Dictionary, GameId, GameStatus, RequirementProfile, UserSpecs } from "@/lib/types";

interface ResultPanelProps {
  dictionary: Dictionary;
  game: GameId;
  result: CompatibilityResult | null;
  profile: RequirementProfile;
  status: GameStatus;
  specs: UserSpecs;
  stale: boolean;
  shareUrl: string;
  shareState: "idle" | "copied" | "failed";
  onShare: () => void;
  onDownloadImage: () => void;
  imageState: "idle" | "working" | "done" | "failed";
  onClear: () => void;
}

function statusIcon(status: string): string {
  if (status === "meets") return "✓";
  if (status === "below") return "!";
  if (status === "near") return "~";
  return "?";
}

export const ResultPanel = forwardRef<HTMLDivElement, ResultPanelProps>(function ResultPanel(
  { dictionary, game, result, profile, status, specs, stale, shareUrl, shareState, onShare, onDownloadImage, imageState, onClear },
  ref,
) {
  const t = dictionary.checker;
  const c = dictionary.common;
  const translate = (key: string) => c[key] ?? t[key] ?? dictionary.leonida[key] ?? key;
  const componentValue = (key: string) => {
    if (key === "cpu") return cpus.find((cpu) => cpu.id === specs.cpuId)?.name ?? c.unknown;
    if (key === "gpu") return gpus.find((gpu) => gpu.id === specs.gpuId)?.name ?? c.unknown;
    if (key === "ram") return specs.ramGB === null ? c.unknown : `${specs.ramGB} GB`;
    if (key === "vram") {
      const gpu = gpus.find((item) => item.id === specs.gpuId);
      const value = specs.vramOverrideGB ?? gpu?.vramGB;
      return value === null || value === undefined || gpu?.memoryType === "shared" ? c.unknown : `${value} GB`;
    }
    if (key === "os") return t[specs.os] ?? c.unknown;
    if (key === "architecture") return t[specs.architecture] ?? c.unknown;
    if (key === "storage") return `${specs.diskType === "unknown" ? c.unknown : t[specs.diskType]} · ${specs.freeDiskGB === null ? c.unknown : `${specs.freeDiskGB} GB`}`;
    return c.unknown;
  };

  return (
    <div ref={ref} tabIndex={-1} className="panel self-start p-5 outline-none sm:p-6 lg:sticky lg:top-6" aria-live="polite" data-clarity-mask="true">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t.resultTitle}</h2>
        <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-bold text-warning">{c.forecast}</span>
      </div>

      {!result ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-black/10 px-5 py-10 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full border border-secondary/40 bg-secondary/10 text-2xl text-secondary" aria-hidden="true">?</div>
          <h3 className="mt-4 text-lg font-extrabold">{t.initialTitle}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.initialBody}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-warning"><span className="status-dot" aria-hidden="true" />{t.availability}</div>
            <p className="mt-1 font-extrabold">{game === "leonida" ? dictionary.leonida.gameplayValue : t.availabilityValue}</p>
            <p className="mt-1 text-sm text-muted">{t.availabilityBody}</p>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted">{t.readiness}</p>
            <p className={`mt-2 text-3xl font-black tracking-tight ${result.tier === "unknown" ? "text-warning" : result.tier === "unlikely" ? "text-danger" : "text-success"}`}>
              {result.tier === "unknown" ? c.unknownTier : translate(result.tier)}
            </p>
            <p className="mt-1 text-xs text-muted">{t.against}: <bdi dir="ltr">{profile.id}</bdi></p>
          </div>

          {result.tier === "unknown" && (
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="font-extrabold text-warning">{game === "leonida" ? dictionary.leonida.historicalUnknown : t.unknownTierTitle}</p>
              <p className="mt-1 text-sm text-muted">{game === "leonida" ? dictionary.leonida.historicalUnknownBody : t.unknownTierBody}</p>
            </div>
          )}

          <div className="mt-5">
            <h3 className="font-extrabold">{t.components}</h3>
            <ul className="mt-2 divide-y divide-border/80">
              {result.components.map((component) => (
                <li key={component.key} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-bold">{translate(component.key)}</p>
                    <p className="text-xs text-muted" dir="auto">{componentValue(component.key)}</p>
                    <p className="mt-1 max-w-md text-xs text-muted" dir="auto">{translate(component.reasonKey)}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-current/20 px-2 py-1 text-xs font-bold status-${component.status}`}>
                    <span aria-hidden="true">{statusIcon(component.status)}</span>
                    {translate(component.status)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-black/10 p-4">
            <h3 className="font-extrabold">{t.limitations}</h3>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted">
              {result.limitations.map((key) => <li key={key}>{translate(key)}</li>)}
            </ul>
            <p className="mt-3 border-t border-border pt-3 text-xs font-bold text-warning">{t.noFps}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3"><span className="block text-muted">{t.confidence}</span><strong>{result.confidence === "unknown" ? c.unknownConfidence : translate(result.confidence)}</strong></div>
            <div className="rounded-lg border border-border p-3"><span className="block text-muted">{t.profileVersion}</span><strong dir="ltr">{result.profileVersion}</strong></div>
          </div>

          {stale && <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm font-bold text-warning">{t.resultStale}</p>}

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <button type="button" className="btn-primary" onClick={onShare}>{c.copyLink}</button>
            <button type="button" className="btn-secondary" onClick={onDownloadImage} disabled={imageState === "working"}>{imageState === "working" ? t.imageWorking : t.downloadImage}</button>
            <button type="button" className="btn-ghost" onClick={onClear}>{t.clearSaved}</button>
          </div>
          {shareState === "copied" && <p role="status" className="mt-2 text-sm text-success">{t.shareSuccess}</p>}
          {imageState === "done" && <p role="status" className="mt-2 text-sm text-success">{t.imageReady}</p>}
          {imageState === "failed" && <p role="alert" className="mt-2 text-sm text-danger">{t.imageFailed}</p>}
          {shareState === "failed" && (
            <div className="mt-2">
              <p className="text-sm text-warning">{c.copyFailed}</p>
              <input readOnly value={shareUrl} className="field mt-2 text-xs" dir="ltr" onFocus={(event) => event.currentTarget.select()} aria-label={c.copyLink} />
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted">{status.checkedAt}</p>
        </>
      )}
    </div>
  );
});
