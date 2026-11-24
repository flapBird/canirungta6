import routesData from "@/data/routes.json";
import type { Locale } from "@/lib/types";

export const locales: Locale[] = ["en", "es", "ar"];
export const businessPages = ["home", "leonida", "requirements", "status"] as const;
export type PageId = keyof typeof routesData;

export function localePath(page: PageId, locale: Locale): string {
  const slug = routesData[page][locale];
  return slug ? `/${slug}/` : "/";
}

export const parentPages: Partial<Record<PageId, PageId>> = { chapter3: "chapters", chapter4: "chapters", mandy: "characters" };

export const guidePages = ["chapters", "chapter3", "chapter4", "characters", "mandy", "money"] as const satisfies readonly PageId[];

export function isGuidePage(page: PageId): boolean {
  return (guidePages as readonly PageId[]).includes(page);
}

function normalizePath(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return decoded.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
}

export function pageFromPathname(locale: Locale, pathname: string): PageId {
  const target = normalizePath(pathname);
  return (Object.keys(routesData) as PageId[]).find((page) => normalizePath(localePath(page, locale)) === target) ?? "home";
}

export function breadcrumbTrail(page: PageId): PageId[] {
  const trail: PageId[] = [];
  for (let current: PageId | undefined = page; current; current = parentPages[current]) trail.unshift(current);
  return trail;
}

export function pageFromSlug(locale: Locale, slug?: string): PageId | null {
  if (!slug && locale === "en") return "home";
  let decodedSlug = slug;
  if (slug) {
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {
      decodedSlug = slug;
    }
  }
  for (const [id, paths] of Object.entries(routesData)) {
    if (paths[locale] === slug || paths[locale] === decodedSlug) return id as PageId;
  }
  const segment = decodedSlug?.split("/").filter(Boolean).at(-1);
  for (const [id, paths] of Object.entries(routesData)) {
    const route = paths[locale];
    const routeSegment = route.split("/").filter(Boolean).at(-1);
    if (segment && routeSegment === segment) return id as PageId;
  }
  return null;
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function alternateLinks(page: PageId, origin: string) {
  return [
    ...locales.map((locale) => ({ hrefLang: locale, href: `${origin}${localePath(page, locale)}` })),
    { hrefLang: "x-default", href: `${origin}${localePath(page, "en")}` },
  ];
}
