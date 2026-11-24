import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { GuidePageHeader } from "@/features/guides/GuidePageHeader";
import { guideCharacters, guideUpdatedAt, pageSourceIds } from "@/lib/guide-data";
import { localePath } from "@/lib/i18n-routes";
import { siteOrigin } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

export function MandyPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.guides;
  const mandy = guideCharacters.find((character) => character.id === "mandy")!;
  const url = `${siteOrigin}${localePath("mandy", locale)}`;
  const facts = [t.mandyFact1, t.mandyFact2, t.mandyFact3, t.mandyFact4, t.mandyFact5];
  const unknowns = [t.mandyUnknown1, t.mandyUnknown2, t.mandyUnknown3];
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <GuidePageHeader eyebrow={t.mandyEyebrow} title={dictionary.seo.mandy.title} intro={t.mandyIntro} dictionary={dictionary} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: dictionary.seo.mandy.title,
        description: dictionary.seo.mandy.description,
        dateModified: guideUpdatedAt,
        inLanguage: locale,
        mainEntityOfPage: url,
        about: { "@type": "Person", name: "Mandy" },
        publisher: { "@type": "Organization", name: "VI Ready" },
        isAccessibleForFree: true,
      }} />

      <details className="panel mt-8 border-warning/40 p-5">
        <summary className="min-h-11 cursor-pointer py-2 font-bold text-warning">{t.spoilerTitle}</summary>
        <p className="mt-2 max-w-4xl text-sm text-muted">{t.spoilerBody}</p>
      </details>

      <section className="panel mt-6 p-5 sm:p-7" aria-labelledby="mandy-answer-title">
        <h2 id="mandy-answer-title" className="text-2xl font-extrabold text-accent">{t.mandyAnswerTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.mandyAnswerBody}</p>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5 sm:p-7" aria-labelledby="mandy-facts-title">
          <h2 id="mandy-facts-title" className="text-2xl font-extrabold">{t.mandyFactsTitle}</h2>
          <ol className="mt-5 grid gap-3">
            {facts.map((fact, index) => <li key={fact} className="flex gap-3 rounded-xl border border-border bg-black/10 p-4"><span className="font-black text-secondary" dir="ltr">{String(index + 1).padStart(2, "0")}</span><span className="text-muted">{fact}</span></li>)}
          </ol>
        </section>
        <aside className="panel border-accent/40 p-5 sm:p-7">
          <p className="eyebrow">{t.playedBy}</p>
          <p className="mt-3 text-2xl font-black"><bdi>{mandy.performer}</bdi></p>
          <p className="mt-3 text-sm text-muted">{t.mandyCastBody}</p>
          <span className="mt-4 inline-flex rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{dictionary.common.official}</span>
        </aside>
      </div>

      <section className="panel mt-6 border-warning/40 p-5 sm:p-7" aria-labelledby="mandy-theory-title">
        <h2 id="mandy-theory-title" className="text-2xl font-extrabold text-warning">{t.mandyTheoryTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.mandyTheoryBody}</p>
      </section>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><h2>{t.mandyUnknownTitle}</h2><ul className="mt-3 grid list-disc gap-2 ps-5">{unknowns.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="panel p-6"><h2>{t.mandyPopularityTitle}</h2><p className="mt-3">{t.mandyPopularityBody}</p></section>
        <section className="panel p-6"><h2>{t.mandyCastTitle}</h2><p className="mt-3">{t.mandyCastBody}</p></section>
        <section className="panel p-6"><h2>{t.mandyMoreCharacters}</h2><p className="mt-3">{t.charactersMandyBody}</p><a href={localePath("characters", locale)} className="mt-4 inline-flex min-h-11 items-center font-bold text-accent hover:underline">{t.charactersCrumb} <span className="flip-in-rtl" aria-hidden="true">→</span></a></section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={localePath("characters", locale)} className="btn-secondary">{t.charactersCrumb}</a>
        <a href={localePath("chapter3", locale)} className="btn-secondary">{t.chapter3Crumb}</a>
        <a href={localePath("home", locale)} className="btn-primary">{dictionary.common.backToChecker}</a>
      </div>
      <div className="mt-12"><SourceList ids={pageSourceIds("mandy")} dictionary={dictionary} title={dictionary.common.sources} /></div>
    </div>
  );
}
