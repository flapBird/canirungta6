import en from "../../messages/en.json";
import es from "../../messages/es.json";
import ar from "../../messages/ar.json";
import routesData from "@/data/routes.json";
import { pageFromSlug } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

const pages = Object.keys(routesData) as (keyof typeof routesData)[];

function normalizeDictionary(raw: Omit<Dictionary, "seo" | "direction"> & { direction: string; seo: Record<string, string> }): Dictionary {
  return {
    ...raw,
    direction: raw.direction as Dictionary["direction"],
    seo: Object.fromEntries(pages.map((page) => [page, {
      title: raw.seo[`${page}.title`],
      description: raw.seo[`${page}.description`],
    }])),
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: normalizeDictionary(en),
  es: normalizeDictionary(es),
  ar: normalizeDictionary(ar),
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function resolvePage(locale: Locale, slug: string) {
  return pageFromSlug(locale, slug);
}

export function interpolate(value: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce((text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)), value);
}
