import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { GuideCard } from "@/features/guides/GuideCard";
import { GuidePageHeader } from "@/features/guides/GuidePageHeader";
import { guideCharacters, pageSourceIds } from "@/lib/guide-data";
import { localePath } from "@/lib/i18n-routes";
import { siteOrigin } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

const groups = ["lead", "supporting", "contact"] as const;

export function CharactersPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.guides;
  const url = `${siteOrigin}${localePath("characters", locale)}`;
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <GuidePageHeader eyebrow={t.charactersEyebrow} title={dictionary.seo.characters.title} intro={t.charactersIntro} dictionary={dictionary} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: dictionary.seo.characters.title,
        numberOfItems: guideCharacters.length,
        itemListElement: guideCharacters.map((character, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: character.name,
          url: character.page ? `${siteOrigin}${localePath(character.page, locale)}` : `${url}#character-${character.id}`,
        })),
      }} />

      <section className="panel mt-8 p-5 sm:p-7" aria-labelledby="cast-note-title">
        <h2 id="cast-note-title" className="text-2xl font-extrabold text-secondary">{t.castNoteTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.castNoteBody}</p>
      </section>

      {groups.map((group) => (
        <section key={group} className="mt-10" aria-labelledby={`characters-${group}-title`}>
          <h2 id={`characters-${group}-title`} className="text-2xl font-extrabold">{t[`characters${group[0].toUpperCase()}${group.slice(1)}Title`]}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guideCharacters.filter((character) => character.group === group).map((character) => {
              const bioKey = `char${character.id[0].toUpperCase()}${character.id.slice(1)}Bio`;
              return (
                <article key={character.id} id={`character-${character.id}`} className="panel flex min-w-0 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-extrabold text-accent"><bdi>{character.name}</bdi></h3>
                    <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted">{t[`role${group[0].toUpperCase()}${group.slice(1)}`]}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">{t.playedBy} <bdi>{character.performer}</bdi></p>
                  <p className="mt-4 flex-1 text-sm text-muted">{t[bioKey]}</p>
                  {character.page && <a href={localePath(character.page, locale)} className="mt-4 inline-flex min-h-11 items-center font-bold text-accent hover:underline">{t.charactersMandyTitle} <span className="flip-in-rtl" aria-hidden="true">→</span></a>}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="panel mt-10 border-accent/40 p-5 sm:p-7">
        <h2 className="text-2xl font-extrabold text-accent">{t.charactersMandyTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.charactersMandyBody}</p>
        <a href={localePath("mandy", locale)} className="btn-primary mt-5">{t.mandyCrumb} <span className="flip-in-rtl" aria-hidden="true">→</span></a>
      </section>

      <div className="mt-10"><GuideCard page="chapters" title={t.charactersChaptersTitle} body={t.charactersChaptersBody} locale={locale} /></div>
      <div className="mt-12"><SourceList ids={pageSourceIds("characters")} dictionary={dictionary} title={dictionary.common.sources} /></div>
    </div>
  );
}
