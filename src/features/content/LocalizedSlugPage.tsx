import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary, resolvePage } from "@/lib/i18n";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { ChapterPage } from "./ChapterPage";
import { ChaptersPage } from "./ChaptersPage";
import { CharactersPage } from "./CharactersPage";
import { LeonidaHome } from "./LeonidaHome";
import { MandyPage } from "./MandyPage";
import { MoneyPage } from "./MoneyPage";
import { RequirementsPage } from "./RequirementsPage";
import { StatusPage } from "./StatusPage";
import { SupportPage } from "./SupportPage";

export function LocalizedSlugPage({ locale, slug }: { locale: Locale; slug: string }) {
  const page = resolvePage(locale, slug);
  if (!page) notFound();
  const dictionary = getDictionary(locale);
  return (
    <>
      <Breadcrumbs locale={locale} dictionary={dictionary} page={page} />
      <JsonLd data={breadcrumbJsonLd(page, locale, dictionary)} />
      {(page === "leonida" || page === "requirements" || page === "status") && (
        <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: dictionary.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />
      )}
      {page === "leonida" && <LeonidaHome locale={locale} dictionary={dictionary} />}
      {page === "requirements" && <RequirementsPage locale={locale} dictionary={dictionary} />}
      {page === "status" && <StatusPage locale={locale} dictionary={dictionary} />}
      {page === "chapters" && <ChaptersPage locale={locale} dictionary={dictionary} />}
      {(page === "chapter3" || page === "chapter4") && <ChapterPage page={page} locale={locale} dictionary={dictionary} />}
      {page === "characters" && <CharactersPage locale={locale} dictionary={dictionary} />}
      {page === "mandy" && <MandyPage locale={locale} dictionary={dictionary} />}
      {page === "money" && <MoneyPage locale={locale} dictionary={dictionary} />}
      {(page === "methodology" || page === "privacy" || page === "terms" || page === "cookies" || page === "about") && <SupportPage page={page} locale={locale} dictionary={dictionary} />}
    </>
  );
}
