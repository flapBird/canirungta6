import { describe, expect, it } from "vitest";
import arabic from "../../messages/ar.json";
import english from "../../messages/en.json";
import spanish from "../../messages/es.json";
import routes from "../../src/data/routes.json";
import { getDictionary } from "../../src/lib/i18n";
import { alternateLinks, businessPages, localePath, locales, pageFromSlug } from "../../src/lib/i18n-routes";
import { pageMetadata, siteOrigin } from "../../src/lib/seo";

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  if (Array.isArray(value)) return value.reduce<Record<string, string>>((result, item, index) => ({ ...result, ...flatten(item, `${prefix}.${index}`) }), {});
  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, string>>((result, [key, item]) => ({ ...result, ...flatten(item, prefix ? `${prefix}.${key}` : key) }), {});
  }
  return {};
}

describe("localized dictionaries", () => {
  it("has identical key coverage across all languages", () => {
    const expected = Object.keys(flatten(english)).sort();
    expect(Object.keys(flatten(spanish)).sort()).toEqual(expected);
    expect(Object.keys(flatten(arabic)).sort()).toEqual(expected);
  });

  it("preserves interpolation placeholders", () => {
    const en = flatten(english);
    for (const [dictionary, locale] of [[spanish, "es"], [arabic, "ar"]] as const) {
      for (const [key, value] of Object.entries(flatten(dictionary))) {
        const placeholders = (text: string) => (text.match(/\{[^{}]+\}/g) ?? []).sort();
        expect(placeholders(value), `${locale}:${key}`).toEqual(placeholders(en[key]));
      }
    }
  });

  it("loads Arabic as RTL and both other languages as LTR", () => {
    expect(getDictionary("ar").direction).toBe("rtl");
    expect(getDictionary("es").direction).toBe("ltr");
    expect(getDictionary("en").direction).toBe("ltr");
  });
});

describe("routes and metadata", () => {
  it("defines 15 unique primary navigation URLs", () => {
    const urls = locales.flatMap((locale) => businessPages.map((page) => localePath(page, locale)));
    expect(urls).toHaveLength(15);
    expect(new Set(urls).size).toBe(15);
    expect(localePath("home", "en")).toBe("/");
    expect(localePath("home", "es")).toBe("/es/");
    expect(localePath("home", "ar")).toBe("/ar/");
  });

  it("resolves localized dynamic route segments without treating them as 404", () => {
    expect(pageFromSlug("en", "can-i-run-leonida")).toBe("leonida");
    expect(pageFromSlug("es", "can-i-run-leonida")).toBe("leonida");
    expect(pageFromSlug("es", "requisitos-gta-6-pc")).toBe("requirements");
    expect(pageFromSlug("ar", "gta-6-pc")).toBe("status");
    expect(pageFromSlug("ar", encodeURIComponent("المنهجية"))).toBe("methodology");
    expect(pageFromSlug("es", "terminos")).toBe("terms");
    expect(pageFromSlug("ar", encodeURIComponent("ملفات-تعريف-الارتباط"))).toBe("cookies");
    expect(pageFromSlug("en", "privacy")).toBe("privacy");
    expect(pageFromSlug("en", "missing")).toBeNull();
  });

  it("keeps sitemap candidates unique and indexable", () => {
    const urls = Object.values(routes).filter((route) => route.indexable).flatMap((route) => (["en", "es"] as const).map((locale) => route[locale]));
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(40);
    expect(urls.every((url) => !url.includes("?"))).toBe(true);
  });

  it("emits self-language canonical and corresponding hreflang URLs", () => {
    for (const locale of locales) {
      const dictionary = getDictionary(locale);
      const metadata = pageMetadata("leonida", locale, dictionary);
      expect(metadata.alternates?.canonical).toBe(`${siteOrigin}${localePath("leonida", locale)}`);
      expect(metadata.alternates?.languages).toMatchObject({
        en: `${siteOrigin}${localePath("leonida", "en")}`,
        es: `${siteOrigin}${localePath("leonida", "es")}`,

        "x-default": `${siteOrigin}${localePath("leonida", "en")}`,
      });
      expect(metadata.alternates?.languages).not.toHaveProperty("ar");
      const images = metadata.openGraph?.images;
      const image = Array.isArray(images) ? images[0] : images;
      expect(image).toMatchObject({ width: 1200, height: 630 });
    }
    expect(alternateLinks("home", siteOrigin)).toHaveLength(3);
    expect(siteOrigin).toBe("https://canirungta6.online");
  });

  it("emits localized metadata for every legal page", () => {
    for (const page of ["privacy", "terms", "cookies"] as const) {
      for (const locale of locales) {
        const metadata = pageMetadata(page, locale, getDictionary(locale));
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(metadata.alternates?.canonical).toBe(`${siteOrigin}${localePath(page, locale)}`);
        expect(metadata.alternates?.languages).toMatchObject({
          en: `${siteOrigin}${localePath(page, "en")}`,
          es: `${siteOrigin}${localePath(page, "es")}`,

          "x-default": `${siteOrigin}${localePath(page, "en")}`,
        });
      }
    }
  });
});
