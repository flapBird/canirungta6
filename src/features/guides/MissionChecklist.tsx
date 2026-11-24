"use client";

import { useEffect, useMemo, useState } from "react";
import { interpolate } from "@/lib/i18n";
import { progressPercent, readProgress, writeProgress } from "@/lib/guide-progress";
import type { ChapterDetailPage, Mission } from "@/lib/guide-data";
import type { Dictionary } from "@/lib/types";

export function MissionChecklist({ page, missions, chapterName, dictionary }: {
  page: ChapterDetailPage;
  missions: Mission[];
  chapterName: string;
  dictionary: Dictionary;
}) {
  const t = dictionary.guides;
  const missionIds = useMemo(() => new Set(missions.map((mission) => mission.id)), [missions]);
  const [{ completed, hydrated }, setProgress] = useState<{ completed: string[]; hydrated: boolean }>({ completed: [], hydrated: false });
  const [storageFailed, setStorageFailed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [cleared, setCleared] = useState(false);
  const percent = progressPercent(completed.length, missions.length);
  const progressLabel = interpolate(t.checklistProgress, { done: completed.length, total: missions.length, percent });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage must be read after hydration.
    setProgress({ completed: readProgress(window.localStorage, page, missionIds), hydrated: true });
  }, [missionIds, page]);

  function save(ids: string[]) {
    const saved = writeProgress(window.localStorage, page, ids, missionIds);
    setStorageFailed(!saved);
    setProgress((current) => ({ ...current, completed: saved ? readProgress(window.localStorage, page, missionIds) : ids }));
  }

  function toggle(id: string) {
    if (!hydrated) return;
    setCleared(false);
    save(completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]);
  }

  function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    save([]);
    setConfirmReset(false);
    setCleared(true);
  }

  return (
    <section className="panel mt-8 p-5 sm:p-7" aria-labelledby="checklist-title" data-guide-page={page}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.checklistTitle}</p>
          <h2 id="checklist-title" className="mt-2 text-2xl font-extrabold tracking-tight">{chapterName}</h2>
          <p className="mt-2 text-sm text-muted">{t.checklistIntro}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={reset} disabled={!hydrated || completed.length === 0}>
          {confirmReset ? t.checklistConfirm : t.checklistReset}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-black/10 p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
          <span>{progressLabel}</span>
          <span className="text-accent" dir="ltr">{percent}%</span>
        </div>
        <progress className="mt-3 h-3 w-full overflow-hidden rounded-full border border-border bg-surface accent-secondary" value={completed.length} max={missions.length} aria-label={progressLabel}>
          {percent}%
        </progress>
        <p className="mt-3 text-xs text-muted">{t.checklistStorage}</p>
        {storageFailed && <p className="mt-2 text-sm font-bold text-warning">{t.checklistStorageFailed}</p>}
        {cleared && <p className="mt-2 text-sm text-success">{interpolate(t.checklistCleared, { name: chapterName })}</p>}
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-2">
        {missions.map((mission, index) => (
          <li key={mission.id} id={`mission-${mission.id}`} className="min-w-0">
            <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${completed.includes(mission.id) ? "border-success/50 bg-success/5" : "border-border bg-black/10 hover:border-secondary/60"}`}>
              <input
                type="checkbox"
                className="size-5 shrink-0 accent-secondary"
                checked={hydrated && completed.includes(mission.id)}
                onChange={() => toggle(mission.id)}
                disabled={!hydrated}
              />
              <span className="w-7 shrink-0 text-sm font-bold text-muted" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold"><bdi>{mission.name}</bdi></span>
                {mission.optional && <span className="mt-1 block text-xs font-bold text-warning">{t.optionalMission}</span>}
                {mission.secondaryTitle && <span className="mt-1 block text-xs font-bold text-secondary">{dictionary.common.secondary}</span>}
              </span>
            </label>
          </li>
        ))}
      </ol>
    </section>
  );
}
