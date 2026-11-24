import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { GuideCard } from "@/features/guides/GuideCard";
import { GuidePageHeader } from "@/features/guides/GuidePageHeader";
import { guideChapters, guideUpdatedAt, pageSourceIds } from "@/lib/guide-data";
import { interpolate } from "@/lib/i18n";
import { localePath } from "@/lib/i18n-routes";
import { siteOrigin } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

export function ChaptersPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.guides;
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <GuidePageHeader eyebrow={t.chaptersEyebrow} title={dictionary.seo.chapters.title} intro={t.chaptersIntro} dictionary={dictionary} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: dictionary.seo.chapters.title,
        numberOfItems: guideChapters.length,
        itemListElement: guideChapters.map((chapter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${chapter.number}. ${chapter.title}`,
          url: `${siteOrigin}${localePath(chapter.page, locale)}`,
        })),
      }} />

      <section className="panel mt-8 border-warning/40 p-5 sm:p-7" aria-labelledby="chapters-answer-title">
        <h2 id="chapters-answer-title" className="text-2xl font-extrabold text-warning">{t.chaptersAnswerTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.chaptersAnswerBody}</p>
        <details className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <summary className="min-h-11 cursor-pointer py-2 font-bold text-warning">{t.spoilerTitle}</summary>
          <p className="mt-2 text-sm text-muted">{t.spoilerBody}</p>
        </details>
      </section>

      <section className="mt-8" aria-labelledby="chapters-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="chapters-list-title" className="text-2xl font-extrabold">{t.chaptersListTitle}</h2>
          <p className="text-sm text-muted">{interpolate(t.sourceNote, { date: guideUpdatedAt })}</p>
        </div>
        <ol className="mt-5 grid gap-4">
          {guideChapters.map((chapter) => {
            const setting = t[`ch${chapter.number}Setting`];
            return (
              <li key={chapter.id} id={`chapter-${chapter.number}`} className="panel min-w-0 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-secondary/40 bg-secondary/10 text-2xl font-black text-secondary" dir="ltr" aria-hidden="true">{String(chapter.number).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-extrabold"><bdi>{chapter.title}</bdi></h3>
                      {(chapter.page === "chapter3" || chapter.page === "chapter4") && <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{t.openChecklist}</span>}
                    </div>
                    <p className="mt-2 text-sm text-muted">{setting}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full border border-border px-2.5 py-1 text-muted">{interpolate(t.missionCount, { count: chapter.reportedMissions })}</span>
                      {chapter.optionalMissions > 0 && <span className="rounded-full border border-warning/40 px-2.5 py-1 text-warning">{interpolate(t.optionalCount, { count: chapter.optionalMissions })}</span>}
                      {chapter.redacted > 0 && <span className="rounded-full border border-border px-2.5 py-1 text-muted">{interpolate(t.redactedCount, { count: chapter.redacted })}</span>}
                    </div>
                  </div>
                  <a href={localePath(chapter.page, locale)} className="btn-secondary shrink-0">{interpolate(t.chapterGoLabel, { count: chapter.number })} <span className="flip-in-rtl" aria-hidden="true">→</span></a>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><h2>{t.countTitle}</h2><p className="mt-3">{t.countBody}</p></section>
        <section className="panel p-6"><h2>{t.tipTitle}</h2><p className="mt-3">{t.tipBody}</p></section>
      </div>

      <section className="mt-10" aria-labelledby="chapter-guides-title">
        <h2 id="chapter-guides-title" className="text-2xl font-extrabold">{t.chapterGoTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(["chapter3", "chapter4"] as const).map((page) => {
            const chapter = guideChapters.find((item) => item.page === page)!;
            return <GuideCard key={page} page={page} eyebrow={interpolate(t.chapterTitle, { count: chapter.number })} title={chapter.title} body={t[`${page}Intro`]} locale={locale} />;
          })}
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <GuideCard page="money" title={t.chaptersMoneyTitle} body={t.chaptersMoneyBody} locale={locale} />
        <GuideCard page="characters" title={t.chaptersCharactersTitle} body={t.chaptersCharactersBody} locale={locale} />
      </div>
      <div className="mt-12"><SourceList ids={pageSourceIds("chapters")} dictionary={dictionary} title={dictionary.common.sources} /></div>
    </div>
  );
}
