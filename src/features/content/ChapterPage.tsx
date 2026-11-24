import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { MissionChecklist } from "@/features/guides/MissionChecklist";
import { GuidePageHeader } from "@/features/guides/GuidePageHeader";
import { chapterDetail, guideDataset, pageSourceIds, type ChapterDetailPage } from "@/lib/guide-data";
import { interpolate } from "@/lib/i18n";
import { localePath } from "@/lib/i18n-routes";
import { siteOrigin } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

export function ChapterPage({ page, locale, dictionary }: { page: ChapterDetailPage; locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.guides;
  const chapter = chapterDetail(page);
  const missions = page === "chapter3" || page === "chapter4" ? guideDataset.missionLists[page] : null;
  const pageUrl = `${siteOrigin}${localePath(page, locale)}`;
  const neighbors = guideDataset.chapters.filter((item) => Math.abs(item.number - chapter.number) === 1);

  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <GuidePageHeader eyebrow={t.chaptersEyebrow} title={dictionary.seo[page].title} intro={t[`${page}Intro`]} dictionary={dictionary} />
      {missions && <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: dictionary.seo[page].title,
        numberOfItems: missions.length,
        itemListElement: missions.map((mission, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: mission.name,
          url: `${pageUrl}#mission-${mission.id}`,
        })),
      }} />}

      <section className="panel mt-8 border-warning/40 p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-3">
          {[[t.missionCount, String(chapter.reportedMissions)], [t.optionalCount, String(chapter.optionalMissions)], [t.redactedCount, String(chapter.redacted)]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-black/10 p-4">
              <p className="text-sm font-bold text-secondary">{interpolate(label, { count: value })}</p>
              <p className="mt-1 text-2xl font-black" dir="ltr">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">{interpolate(t.sourceNote, { date: guideDataset.updatedAt })}</p>
        <details className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <summary className="min-h-11 cursor-pointer py-2 font-bold text-warning">{t.spoilerTitle}</summary>
          <p className="mt-2 text-sm text-muted">{t.spoilerBody}</p>
        </details>
      </section>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><h2>{t.chapterSettingTitle}</h2><p className="mt-3">{t[`ch${chapter.number}Setting`]}</p></section>
        <section className="panel p-6"><h2>{missions ? t.chapterUnlocksTitle : t.progressNotes}</h2><p className="mt-3">{t[`${page}Unlocks`]}</p></section>
      </div>

      {missions && <MissionChecklist page={page} missions={missions} chapterName={chapter.title} dictionary={dictionary} />}

      <section className="panel mt-8 p-5 sm:p-7">
        <h2 className="text-xl font-extrabold">{missions ? t.tipTitle : t.chaptersListTitle}</h2>
        {missions && <p className="mt-3 max-w-4xl text-muted">{t.tipBody}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={localePath("chapters", locale)} className="btn-secondary">{t.chapterAll}</a>
          {neighbors.map((item) => <a key={item.id} href={localePath(item.page, locale)} className="btn-secondary">{interpolate(t.chapterTitle, { count: item.number })} · {item.title}</a>)}
        </div>
      </section>
      <div className="mt-12"><SourceList ids={pageSourceIds(page)} dictionary={dictionary} title={dictionary.common.sources} /></div>
    </div>
  );
}
