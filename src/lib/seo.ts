import type { Metadata } from "next";
import { alternateLinks, breadcrumbTrail, localePath, type PageId } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

export const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://canirungta6.online").replace(/\/$/, "");

export function pageMetadata(page: PageId, locale: Locale, dictionary: Dictionary): Metadata {
  const entry = dictionary.seo[page];
  const url = `${siteOrigin}${localePath(page, locale)}`;
  const languages = Object.fromEntries(alternateLinks(page, siteOrigin).map(({ hrefLang, href }) => [hrefLang, href]));
  return {
    metadataBase: new URL(siteOrigin),
    title: entry.title,
    description: entry.description,
    icons: { icon: "/favicon.svg" },
    alternates: { canonical: url, languages },
    robots: { index: true, follow: true },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url,
      siteName: "VI Ready",
      locale: locale === "ar" ? "ar_AR" : locale === "es" ? "es_ES" : "en_US",
      type: "website",
      images: [{ url: `/og-${locale}.png`, width: 1200, height: 630, alt: entry.title }],
    },
    twitter: { card: "summary_large_image", title: entry.title, description: entry.description, images: [`/og-${locale}.png`] },
  };
}

function crumbName(page: PageId, dictionary: Dictionary): string {
  if (page === "home") return dictionary.common.home;
  return dictionary.guides[`${page}Crumb`] ?? dictionary.seo[page].title;
}

export function breadcrumbJsonLd(page: PageId, locale: Locale, dictionary: Dictionary) {
  const trail = page === "home" ? [] : breadcrumbTrail(page);
  const items: PageId[] = ["home", ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumbName(item, dictionary),
      item: `${siteOrigin}${localePath(item, locale)}`,
    })),
  };
}
