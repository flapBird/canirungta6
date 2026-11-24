import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { CheckerHome } from "@/features/content/CheckerHome";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata, siteOrigin } from "@/lib/seo";

const dictionary = getDictionary("ar");
export const metadata: Metadata = pageMetadata("home", "ar", dictionary);

export default function ArabicHome() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "VI Ready", url: siteOrigin, inLanguage: "ar" }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: dictionary.seo.home.title, url: `${siteOrigin}/ar/`, applicationCategory: "UtilityApplication", operatingSystem: "Any modern web browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, inLanguage: "ar" }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: dictionary.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />
      <CheckerHome locale="ar" dictionary={dictionary} />
    </>
  );
}
