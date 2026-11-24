import { localePath } from "@/lib/i18n-routes";
import type { GuidePage } from "@/lib/guide-data";
import type { Locale } from "@/lib/types";

const numbers: Record<GuidePage, string> = {
  chapters: "01",
  chapter3: "03",
  chapter4: "04",
  characters: "02",
  mandy: "02",
  money: "03",
};

export function GuideCard({ page, eyebrow, title, body, locale }: {
  page: GuidePage;
  eyebrow?: string;
  title: string;
  body: string;
  locale: Locale;
}) {
  return (
    <a href={localePath(page, locale)} className="panel group flex min-h-52 flex-col p-5 transition-colors hover:border-accent/60">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-secondary">{eyebrow ?? "GTA VI"}</span>
        <span className="text-3xl font-black text-white/10" dir="ltr" aria-hidden="true">{numbers[page]}</span>
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-accent">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{body}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
        <span className="flip-in-rtl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </a>
  );
}
