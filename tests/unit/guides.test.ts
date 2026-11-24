import { describe, expect, it } from "vitest";
import { loadDataset, validateDataset } from "../../scripts/validate-data.mjs";
import { guideCharacters, guideChapters, guideDataset, moneyMethods, pageSourceIds } from "../../src/lib/guide-data";
import { parseProgress, progressPercent, progressStorageKey, readProgress, writeProgress } from "../../src/lib/guide-progress";
import { breadcrumbTrail, localePath, pageFromPathname, pageFromSlug } from "../../src/lib/i18n-routes";
import { breadcrumbJsonLd } from "../../src/lib/seo";
import { getDictionary } from "../../src/lib/i18n";

describe("guide routes", () => {
  it("resolves full nested chapter and character paths in every language", () => {
    expect(pageFromSlug("en", "gta-6-chapters/chapter-3")).toBe("chapter3");
    expect(pageFromSlug("es", "capitulos-gta-6/capitulo-4")).toBe("chapter4");
    expect(pageFromSlug("ar", encodeURIComponent("فصول-gta-6/الفصل-3"))).toBe("chapter3");
    expect(pageFromSlug("en", "characters/mandy")).toBe("mandy");
    expect(pageFromSlug("ar", encodeURIComponent("الشخصيات/ماندي"))).toBe("mandy");
    expect(pageFromSlug("en", "characters/not-real")).toBeNull();
  });

  it("resolves pathname navigation without losing nested page identity", () => {
    expect(pageFromPathname("en", "/gta-6-chapters/chapter-4/")).toBe("chapter4");
    expect(pageFromPathname("es", "/es/personajes/mandy/?ref=guide")).toBe("mandy");
    expect(pageFromPathname("ar", `/ar/${encodeURIComponent("الشخصيات/ماندي")}/`)).toBe("mandy");
  });

  it("builds parent breadcrumbs and uses the short localized Home name", () => {
    expect(breadcrumbTrail("chapter3")).toEqual(["chapters", "chapter3"]);
    expect(breadcrumbTrail("mandy")).toEqual(["characters", "mandy"]);
    const jsonLd = breadcrumbJsonLd("mandy", "en", getDictionary("en"));
    expect(jsonLd.itemListElement.map((item: { name: string }) => item.name)).toEqual(["Home", "Characters", "Mandy"]);
  });

  it("emits metadata for all 27 localized guide URLs", () => {
    for (const page of ["chapters", "chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "characters", "mandy", "money"] as const) {
      for (const locale of ["en", "es", "ar"] as const) {
        expect(localePath(page, locale)).not.toBe("/");
        expect(getDictionary(locale).seo[page].title).toBeTruthy();
        expect(getDictionary(locale).seo[page].description).toBeTruthy();
      }
    }
  });
});

describe("guide evidence data", () => {
  it("keeps chapter, character, and money IDs unique and source-backed", () => {
    const dataset = loadDataset();
    expect(validateDataset(dataset)).toEqual([]);
    expect(new Set(guideChapters.map((chapter) => chapter.id)).size).toBe(guideChapters.length);
    expect(new Set(guideCharacters.map((character) => character.id)).size).toBe(guideCharacters.length);
    expect(new Set(moneyMethods.map((method) => method.id)).size).toBe(moneyMethods.length);
    for (const page of Object.keys(pageSourceIds) as (keyof typeof pageSourceIds)[]) {
      expect(pageSourceIds(page).length).toBeGreaterThan(0);
      expect(pageSourceIds(page).every((id) => dataset.sources.some((source) => source.id === id))).toBe(true);
    }
  });

  it("keeps detailed mission counts aligned with their chapter summaries", () => {
    expect(guideDataset.missionLists.chapter3).toHaveLength(27);
    expect(guideDataset.missionLists.chapter3.filter((mission) => mission.optional)).toHaveLength(1);
    expect(guideDataset.missionLists.chapter4).toHaveLength(25);
    expect(guideDataset.missionLists.chapter4.at(-1)).toMatchObject({ name: "From Zero", secondaryTitle: true });
    for (const [page, missions] of Object.entries(guideDataset.missionLists)) {
      expect(missions.length).toBe(guideChapters.find((chapter) => chapter.page === page)?.reportedMissions);
    }
  });

  it("rejects duplicate mission IDs and broken guide page references", () => {
    const duplicate = loadDataset();
    duplicate.guides.missionLists.chapter4[1].id = duplicate.guides.missionLists.chapter4[0].id;
    expect(validateDataset(duplicate).join("\n")).toContain("duplicate or empty id");

    const broken = loadDataset();
    broken.guides.pageSourceIds.money = ["not-registered"];
    expect(validateDataset(broken).join("\n")).toContain("guides money: unknown source not-registered");
  });

  it("does not include prohibited distribution or T3 content in guide copy", () => {
    const copy = JSON.stringify(guideDataset).toLowerCase();
    for (const pattern of [/magnet:\?xt=/, /\.exe\b/, /\.zip\b/, /\.rar\b/, /torrent/, /private server/, /t3 code/, /crack/]) {
      expect(copy).not.toMatch(pattern);
    }
  });
});

describe("local guide progress", () => {
  const chapter3Ids = new Set(guideDataset.missionLists.chapter3.map((mission) => mission.id));

  it("filters malformed, duplicate, unknown, and other-chapter IDs", () => {
    expect(parseProgress(["c3-01", "c3-01", "c4-01", "unknown", 4, null], chapter3Ids)).toEqual(["c3-01"]);
    expect(parseProgress("c3-01", chapter3Ids)).toEqual([]);
    expect(parseProgress({ c3: true }, chapter3Ids)).toEqual([]);
  });

  it("reads versioned progress defensively", () => {
    const values = new Map<string, string>([[progressStorageKey("chapter3"), JSON.stringify(["c3-02", "bad", "c3-02"])]]);
    const storage = { getItem: (key: string) => values.get(key) ?? null };
    expect(readProgress(storage, "chapter3", chapter3Ids)).toEqual(["c3-02"]);
    values.set(progressStorageKey("chapter3"), "{broken");
    expect(readProgress(storage, "chapter3", chapter3Ids)).toEqual([]);
    expect(readProgress({ getItem: () => { throw new Error("blocked"); } }, "chapter3", chapter3Ids)).toEqual([]);
  });

  it("writes only whitelisted IDs and reports storage failures", () => {
    const values = new Map<string, string>();
    const storage = { setItem: (key: string, value: string) => { values.set(key, value); } };
    expect(writeProgress(storage, "chapter3", ["c3-01", "c4-01"], chapter3Ids)).toBe(true);
    expect(JSON.parse(values.get(progressStorageKey("chapter3"))!)).toEqual(["c3-01"]);
    expect(writeProgress({ setItem: () => { throw new Error("blocked"); } }, "chapter3", ["c3-01"], chapter3Ids)).toBe(false);
  });

  it("calculates bounded progress percentages", () => {
    expect(progressPercent(0, 27)).toBe(0);
    expect(progressPercent(14, 27)).toBe(52);
    expect(progressPercent(27, 27)).toBe(100);
    expect(progressPercent(1, 0)).toBe(0);
  });
});
