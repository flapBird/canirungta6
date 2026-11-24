import { interpolate } from "@/lib/i18n";
import { guideUpdatedAt } from "@/lib/guide-data";
import type { Dictionary } from "@/lib/types";

export function GuidePageHeader({ eyebrow, title, intro, dictionary, showUpdated = true }: {
  eyebrow: string;
  title: string;
  intro: string;
  dictionary: Dictionary;
  showUpdated?: boolean;
}) {
  return (
    <header className="max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow">{eyebrow}</p>
        {showUpdated && <span className="text-xs text-muted">{interpolate(dictionary.guides.updated, { date: guideUpdatedAt })}</span>}
      </div>
      <h1 className="gradient-text mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted">{intro}</p>
    </header>
  );
}
