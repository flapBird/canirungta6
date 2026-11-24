import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { SourceList } from "@/components/SourceList";
import { GuideCard } from "@/features/guides/GuideCard";
import { GuidePageHeader } from "@/features/guides/GuidePageHeader";
import { guideUpdatedAt, moneyMethods, pageSourceIds } from "@/lib/guide-data";
import { interpolate } from "@/lib/i18n";
import { localePath } from "@/lib/i18n-routes";
import { siteOrigin } from "@/lib/seo";
import type { Dictionary, Locale } from "@/lib/types";

const statusKeys = { story: "moneyStatusStory", repeatable: "moneyStatusRepeatable", reported: "moneyStatusReported" } as const;

export function MoneyPage({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const t = dictionary.guides;
  const url = `${siteOrigin}${localePath("money", locale)}`;
  const faqItems = [1, 2, 3, 4].map((n) => ({ question: t[`moneyFaq${n}Q`], answer: t[`moneyFaq${n}A`] }));
  return (
    <div className="container-shell pb-4 pt-10 sm:pt-14">
      <GuidePageHeader eyebrow={t.moneyEyebrow} title={dictionary.seo.money.title} intro={t.moneyIntro} dictionary={dictionary} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: dictionary.seo.money.title,
        description: dictionary.seo.money.description,
        dateModified: guideUpdatedAt,
        inLanguage: locale,
        mainEntityOfPage: url,
        about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
        publisher: { "@type": "Organization", name: "VI Ready" },
        isAccessibleForFree: true,
      }} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      }} />

      <section className="panel mt-8 border-warning/40 p-5 sm:p-7" aria-labelledby="money-scope-title">
        <h2 id="money-scope-title" className="text-2xl font-extrabold text-warning">{t.moneyScopeTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.moneyScopeBody}</p>
        <p className="mt-3 text-sm text-muted">{interpolate(t.sourceNote, { date: guideUpdatedAt })}</p>
      </section>

      <section className="mt-8" aria-labelledby="money-systems-title">
        <h2 id="money-systems-title" className="text-2xl font-extrabold">{t.moneySystemsTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[["moneyBankLabel", "moneyBankBody"], ["moneyCashLabel", "moneyCashBody"], ["moneyLootLabel", "moneyLootBody"]].map(([label, body]) => (
            <article key={label} className="panel p-5"><h3 className="font-extrabold text-secondary">{t[label]}</h3><p className="mt-2 text-sm text-muted">{t[body]}</p></article>
          ))}
        </div>
      </section>

      <section className="panel mt-8 p-5 sm:p-7" aria-labelledby="money-methods-title">
        <h2 id="money-methods-title" className="text-2xl font-extrabold text-accent">{t.moneyMethodsTitle}</h2>
        <p className="mt-3 max-w-4xl text-muted">{t.moneyMethodsIntro}</p>
        <div className="table-scroll mt-5"><table>
          <thead><tr><th scope="col">{t.moneyColMethod}</th><th scope="col">{t.moneyColUnlock}</th><th scope="col">{t.moneyColPayout}</th><th scope="col">{t.moneyColStatus}</th></tr></thead>
          <tbody>{moneyMethods.map((method) => (
            <tr key={method.id}>
              <th scope="row" className="font-extrabold"><bdi>{method.n}. {t[`moneyM${method.n}Name`]}</bdi></th>
              <td>{t[`moneyM${method.n}Unlock`]}</td>
              <td className="font-bold text-success"><bdi>{t[`moneyM${method.n}Payout`]}</bdi></td>
              <td><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-bold ${method.status === "reported" ? "border-warning/40 text-warning" : "border-secondary/40 text-secondary"}`}>{t[statusKeys[method.status]]}</span></td>
            </tr>
          ))}</tbody>
        </table></div>
      </section>

      <div className="prose-site mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel border-warning/40 p-6"><h2>{t.moneyVaultTitle}</h2><p className="mt-3">{t.moneyVaultBody}</p></section>
        <section className="panel border-warning/40 p-6"><h2>{t.moneyGlitchTitle}</h2><p className="mt-3">{t.moneyGlitchBody}</p></section>
        <section className="panel p-6"><h2>{t.moneyCheatTitle}</h2><p className="mt-3">{t.moneyCheatBody}</p></section>
        <section className="panel p-6"><h2>{t.moneyOrderTitle}</h2><p className="mt-3">{t.moneyOrderBody}</p></section>
        <section className="panel p-6 lg:col-span-2"><h2>{t.moneyPcTitle}</h2><p className="mt-3">{t.moneyPcBody}</p><div className="mt-4 flex flex-wrap gap-3"><a href={localePath("status", locale)} className="btn-secondary">{dictionary.nav.status}</a><a href={localePath("home", locale)} className="btn-primary">{dictionary.common.backToChecker}</a></div></section>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <GuideCard page="chapter3" title={t.chaptersMoneyTitle} body={t.chapter3Intro} locale={locale} />
        <GuideCard page="characters" title={t.charactersMandyTitle} body={t.charactersMandyBody} locale={locale} />
      </div>
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
        <SourceList ids={pageSourceIds("money")} dictionary={dictionary} title={dictionary.common.sources} />
        <Faq dictionary={dictionary} title={dictionary.checker.faqTitle} items={faqItems} />
      </div>
    </div>
  );
}
