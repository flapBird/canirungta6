import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CheckerHome } from "@/features/content/CheckerHome";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata, siteOrigin } from "@/lib/seo";

const dictionary = getDictionary("en");
export const metadata: Metadata = pageMetadata("home", "en", dictionary);

export default function EnglishHome() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "VI Ready", url: siteOrigin, inLanguage: "en" }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: dictionary.seo.home.title, url: `${siteOrigin}/`, applicationCategory: "UtilityApplication", operatingSystem: "Any modern web browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, inLanguage: "en" }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: dictionary.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />
      <CheckerHome locale="en" dictionary={dictionary} />
    </>
  );
}
