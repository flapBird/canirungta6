"use client";
/* eslint-disable react-hooks/set-state-in-effect -- static HTML must hydrate browser-only URL and saved specs after mount */

import { useEffect, useMemo, useRef, useState } from "react";
import { cpus, gameStatuses, gpus, profiles } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { evaluateCompatibility } from "@/lib/compatibility-engine";
import { detectHardware, type HardwareDetection } from "@/lib/hardware-detection";
import { downloadShareCard } from "@/lib/share-generator";
import {
  clearSavedSpecs,
  emptySpecs,
  leonidaProfiles,
  parseLeonidaProfile,
  parseSpecs,
  readSavedSpecs,
  saveSpecs,
  serializeSpecs,
  type LeonidaProfileId,
} from "@/lib/url-state";
import type { CompatibilityResult, DeviceType, Dictionary, GameId, Locale, UserSpecs } from "@/lib/types";
import { HardwareCombobox } from "./HardwareCombobox";
import { DxDiagImport } from "./DxDiagImport";
import { RequirementsTable } from "./RequirementsTable";
import { ResultPanel } from "./ResultPanel";
import { UpgradeSimulator } from "./UpgradeSimulator";

interface CheckerToolProps {
  locale: Locale;
  dictionary: Dictionary;
  game: GameId;
}

const ramOptions = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export function CheckerTool({ locale, dictionary, game }: CheckerToolProps) {
  const t = dictionary.checker;
  const [specs, setSpecs] = useState<UserSpecs>({ ...emptySpecs });
  const [profileId, setProfileId] = useState<LeonidaProfileId>(leonidaProfiles[0]);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [resultSpecs, setResultSpecs] = useState<UserSpecs | null>(null);
  const [stale, setStale] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<HardwareDetection | null>(null);
  const [detectionConfirmed, setDetectionConfirmed] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [customRam, setCustomRam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");
  const [imageState, setImageState] = useState<"idle" | "working" | "done" | "failed">("idle");
  const resultRef = useRef<HTMLDivElement>(null);

  const gameProfiles = useMemo(() => profiles.filter((profile) => profile.game === game), [game]);
  const profile = gameProfiles.find((item) => item.id === profileId) ?? gameProfiles[0];
  const status = gameStatuses.find((item) => item.game === game)!;

  useEffect(() => {
    const parsed = parseSpecs(window.location.search, cpus, gpus);
    if (game === "leonida") setProfileId(parseLeonidaProfile(new URLSearchParams(window.location.search).get("profile")));
    setSpecs(parsed.hasUrlState ? parsed.specs : readSavedSpecs() ?? { ...emptySpecs });
    setCustomRam(parsed.specs.ramGB !== null && !ramOptions.includes(parsed.specs.ramGB));
    setHydrated(true);
  }, [game]);

  const updateSpecs = (patch: Partial<UserSpecs>) => {
    setSpecs((current) => {
      const next = { ...current, ...patch };
      if (hydrated) saveSpecs(next);
      return next;
    });
    setStale(result !== null);
    setShareState("idle");
    setImageState("idle");
    setError(null);
  };

  const runDetection = async () => {
    if (detecting) return;
    setDetecting(true);
    setDetectionMessage(null);
    trackEvent("auto_detect_click", { locale, game });
    try {
      const detected = await detectHardware(gpus);
      setDetection(detected);
      setDetectionConfirmed(false);
      updateSpecs({
        ...(detected.gpuId ? { gpuId: detected.gpuId } : {}),
        ...(detected.ramGB !== null ? { ramGB: detected.ramGB } : {}),
        os: detected.os,
        architecture: detected.architecture,
      });
      if (detected.ramGB !== null && !ramOptions.includes(detected.ramGB)) setCustomRam(true);
      if (detected.softwareRenderer) setDetectionMessage(t.softwareRenderer);
      else if (!detected.gpuId) setDetectionMessage(t.detectFailed);
      trackEvent("auto_detect_success", { locale, game, matched: Boolean(detected.gpuId) });
    } catch {
      setDetectionMessage(t.detectFailed);
    } finally {
      setDetecting(false);
    }
  };

  const validate = () => {
    if (detection && !detectionConfirmed) return t.confirmDetected;
    if (specs.ramGB !== null && (!Number.isFinite(specs.ramGB) || specs.ramGB < 1 || specs.ramGB > 256)) return t.invalidRange;
    if (specs.vramOverrideGB !== null && (!Number.isFinite(specs.vramOverrideGB) || specs.vramOverrideGB < 0.5 || specs.vramOverrideGB > 64)) return t.invalidRange;
    if (specs.freeDiskGB !== null && (!Number.isFinite(specs.freeDiskGB) || specs.freeDiskGB < 0 || specs.freeDiskGB > 1_000_000)) return t.invalidRange;
    return null;
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;
    trackEvent("checker_started", { locale, game });
    const nextResult = evaluateCompatibility(specs, profile, status);
    setResult(nextResult);
    setResultSpecs({ ...specs });
    setStale(false);
    saveSpecs(specs);
    const query = serializeSpecs(specs, game === "leonida" ? profile.id as LeonidaProfileId : undefined);
    const url = `${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    setShareUrl(`${window.location.origin}${url}`);
    setShareState("idle");
    setImageState("idle");
    trackEvent("checker_completed", { locale, game, tier: nextResult.tier, confidence: nextResult.confidence });
    if (game === "leonida") trackEvent("leonida_checker_completed", { locale, profile_id: profile.id });
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      resultRef.current?.focus({ preventScroll: true });
    });
  };

  const share = async () => {
    const query = serializeSpecs(specs, game === "leonida" ? profile.id as LeonidaProfileId : undefined);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      trackEvent("share_result", { method: "clipboard", game, locale });
    } catch {
      setShareState("failed");
    }
  };

  const downloadImage = async () => {
    if (!result || !resultSpecs || imageState === "working") return;
    setImageState("working");
    try {
      await downloadShareCard({ locale, dictionary, specs: resultSpecs, result, profile, status });
      setImageState("done");
      trackEvent("share_result", { method: "png", game, locale });
    } catch {
      setImageState("failed");
    }
  };

  const clear = () => {
    clearSavedSpecs();
    setSpecs({ ...emptySpecs });
    setResult(null);
    setResultSpecs(null);
    setDetection(null);
    setDetectionConfirmed(false);
    setDetectionMessage(null);
    setCustomRam(false);
    setStale(false);
    setShareState("idle");
    setImageState("idle");
    setShareUrl("");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const detectionNotes = detection ? [
    detection.logicalThreads ? t.threadsNote.replace("{count}", String(detection.logicalThreads)) : null,
    detection.ramGB !== null ? t.memoryNote.replace("{count}", String(detection.ramGB)) : null,
    detection.osAmbiguous ? t.osNote : null,
  ].filter(Boolean) : [];

  return (
    <>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[48fr_52fr]">
        <form className="panel p-5 sm:p-6" onSubmit={submit} data-clarity-mask="true">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{game === "leonida" ? dictionary.leonida.checkTitle : t.specsTitle}</h2>
          {game === "leonida" && (
            <div className="mt-4">
              <label htmlFor="leonida-profile" className="field-label">{dictionary.leonida.profile}</label>
              <select id="leonida-profile" className="field" value={profile.id} onChange={(event) => {
                setProfileId(event.target.value as LeonidaProfileId);
                setResult(null);
                setResultSpecs(null);
                setImageState("idle");
                setStale(false);
              }}>
                <option value={leonidaProfiles[0]}>{dictionary.leonida.profileLow}</option>
                <option value={leonidaProfiles[1]}>{dictionary.leonida.profileHigh}</option>
              </select>
            </div>
          )}

          <button type="button" className="btn-secondary mt-5 w-full" onClick={runDetection} disabled={detecting}>
            <span aria-hidden="true">⌁</span>{detecting ? t.detecting : t.detect}
          </button>
          {detection && (
            <div className="mt-3 rounded-xl border border-warning/40 bg-warning/5 p-3 text-sm text-warning" role="status">
              <p>{t.detectedNote}</p>
              {detectionMessage && <p className="mt-1 font-bold">{detectionMessage}</p>}
              {detectionNotes.length > 0 && <ul className="mt-1 list-disc ps-5 text-muted">{detectionNotes.map((note) => <li key={note}>{note}</li>)}</ul>}
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 font-bold">
                <input type="checkbox" checked={detectionConfirmed} onChange={(event) => setDetectionConfirmed(event.target.checked)} className="size-5 accent-[#a78bfa]" />
                {t.confirmDetected}
              </label>
            </div>
          )}

          <fieldset className="mt-5">
            <legend className="field-label">{t.deviceType}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["desktop", "laptop", "integrated", "other"] as DeviceType[]).map((device) => (
                <button
                  key={device}
                  type="button"
                  aria-pressed={specs.deviceType === device}
                  onClick={() => updateSpecs({ deviceType: device })}
                  className={`min-h-11 rounded-lg border px-2 text-sm font-bold ${specs.deviceType === device ? "border-secondary bg-secondary/20 text-text" : "border-border bg-black/10 text-muted hover:border-secondary/60"}`}
                >
                  {t[device]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <HardwareCombobox id="cpu" label={t.processor} placeholder={t.searchCpu} items={cpus} value={specs.cpuId} onChange={(cpuId) => updateSpecs({ cpuId })} dictionary={dictionary} />
            <HardwareCombobox id="gpu" label={t.graphicsCard} placeholder={t.searchGpu} items={gpus} value={specs.gpuId} onChange={(gpuId) => updateSpecs({ gpuId, vramOverrideGB: null })} dictionary={dictionary} />

            <div>
              <label htmlFor="ram" className="field-label">{t.ram}</label>
              <select id="ram" className="field" value={customRam ? "custom" : specs.ramGB === null ? "unknown" : String(specs.ramGB)} onChange={(event) => {
                const value = event.target.value;
                setCustomRam(value === "custom");
                updateSpecs({ ramGB: value === "unknown" || value === "custom" ? null : Number(value) });
              }}>
                <option value="unknown">{t.chooseUnknown}</option>
                {ramOptions.map((ram) => <option key={ram} value={ram}>{ram} GB</option>)}
                <option value="custom">{t.customRam}</option>
              </select>
              {customRam && <input type="number" min="1" max="256" step="1" inputMode="numeric" className="field mt-2" value={specs.ramGB ?? ""} placeholder={t.customRam} onChange={(event) => updateSpecs({ ramGB: event.target.value === "" ? null : Number(event.target.value) })} aria-label={t.customRam} />}
            </div>

            <div>
              <label htmlFor="vram" className="field-label">{t.vram}</label>
              <input id="vram" type="number" min="0.5" max="64" step="0.5" inputMode="decimal" className="field" value={specs.vramOverrideGB ?? ""} placeholder={t.vramAuto} onChange={(event) => updateSpecs({ vramOverrideGB: event.target.value === "" ? null : Number(event.target.value) })} />
              <p className="mt-1 text-xs text-muted">{t.vramOverride}</p>
            </div>

            <div>
              <label htmlFor="os" className="field-label">{t.os}</label>
              <select id="os" className="field" value={specs.os} onChange={(event) => updateSpecs({ os: event.target.value as UserSpecs["os"] })}>
                <option value="unknown">{t.chooseUnknown}</option>
                {(["windows10", "windows11", "linux", "macos", "other"] as const).map((os) => <option key={os} value={os}>{t[os]}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="architecture" className="field-label">{t.architecture}</label>
              <select id="architecture" className="field" value={specs.architecture} onChange={(event) => updateSpecs({ architecture: event.target.value as UserSpecs["architecture"] })}>
                <option value="unknown">{t.chooseUnknown}</option>
                {(["x64", "arm64", "other"] as const).map((architecture) => <option key={architecture} value={architecture}>{t[architecture]}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="disk" className="field-label">{t.diskType}</label>
              <select id="disk" className="field" value={specs.diskType} onChange={(event) => updateSpecs({ diskType: event.target.value as UserSpecs["diskType"] })}>
                <option value="unknown">{t.chooseUnknown}</option>
                <option value="ssd">{t.ssd}</option>
                <option value="hdd">{t.hdd}</option>
              </select>
            </div>

            <div>
              <label htmlFor="free-disk" className="field-label">{t.freeDisk}</label>
              <input id="free-disk" type="number" min="0" max="1000000" step="1" inputMode="numeric" className="field" value={specs.freeDiskGB ?? ""} placeholder={t.unknown} onChange={(event) => updateSpecs({ freeDiskGB: event.target.value === "" ? null : Number(event.target.value) })} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="resolution" className="field-label">{t.resolution}</label>
              <select id="resolution" className="field" value={specs.resolution} onChange={(event) => updateSpecs({ resolution: event.target.value as UserSpecs["resolution"] })}>
                <option value="1080p">1080p</option><option value="1440p">1440p</option><option value="2160p">4K (2160p)</option>
              </select>
            </div>
          </div>

          {error && <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-bold text-danger">{error}</p>}
          <button type="submit" className="btn-primary mt-5 w-full text-base" disabled={detecting}>{game === "leonida" ? dictionary.leonida.checkCta : t.check}</button>
          <p className="mt-3 text-center text-xs text-muted">{t.trust}</p>
          <details className="mt-4 border-t border-border pt-3 text-sm">
            <summary className="min-h-11 cursor-pointer py-2 font-bold text-accent">{t.manualHelpTitle}</summary>
            <p className="text-muted">{t.manualHelp}</p>
          </details>
          <DxDiagImport dictionary={dictionary} onApply={updateSpecs} />
        </form>

        <ResultPanel
          ref={resultRef}
          dictionary={dictionary}
          game={game}
          result={result}
          profile={profile}
          status={status}
          specs={specs}
          stale={stale}
          shareUrl={shareUrl}
          shareState={shareState}
          onShare={share}
          onDownloadImage={() => void downloadImage()}
          imageState={imageState}
          onClear={clear}
        />
      </div>
      {result && resultSpecs && (
        <UpgradeSimulator
          key={`${profile.id}:${result.profileVersion}:${serializeSpecs(resultSpecs)}`}
          dictionary={dictionary}
          profile={profile}
          status={status}
          baselineSpecs={resultSpecs}
          baselineResult={result}
        />
      )}
      <RequirementsTable dictionary={dictionary} profile={profile} specs={specs} />
    </>
  );
}
