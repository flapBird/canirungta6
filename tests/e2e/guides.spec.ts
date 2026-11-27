import { expect, test, type Page } from "@playwright/test";
import routes from "../../src/data/routes.json";
import guides from "../../src/data/guides.json";

const locales = ["en", "es", "ar"] as const;
const guidePages = ["chapters", "chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "characters", "mandy", "money", "vehicleTracker", "map", "patch"] as const;
const origin = "https://canirungta6.online";

function routePath(page: (typeof guidePages)[number], locale: (typeof locales)[number]): string {
  return `/${encodeURI(routes[page][locale])}/`;
}

function runtimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("G01: all 36 localized guide URLs export canonical static HTML", async ({ request }) => {
  for (const page of guidePages) {
    for (const locale of locales) {
      const path = routePath(page, locale);
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"], path).toContain("text/html");
      const html = await response.text();
      const canonical = `${origin}${path}`;
      expect(html, path).toContain(`<link rel="canonical" href="${canonical}"`);
      expect(html, path).toContain(`<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"`);
      expect(html, path).toContain("<h1");
      expect(html, path).not.toContain('<meta name="robots" content="noindex');
      const renderedHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
      expect(renderedHtml, path).not.toMatch(/\{(?:count|date|done|total|percent|name|number)\}/);
      expect(html).not.toContain('hrefLang="ar"');
      for (const alternate of ["en", "es"] as const) {
        expect(html, path).toContain(`<link rel="alternate" hrefLang="${alternate}" href="${origin}${routePath(page, alternate)}"`);
      }
    }
  }
});

test("G02: chapter checklist persists locally, resets in two clicks, and sends no telemetry", async ({ page }) => {
  const requests: string[] = [];
  const errors = runtimeErrors(page);
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.postData() ?? ""}`));
  await page.goto("/gta-6-chapters/chapter-3/");
  const checklist = page.locator('[data-guide-page="chapter3"]');
  await expect(checklist.getByRole("checkbox")).toHaveCount(27);
  const firstMission = checklist.getByRole("checkbox").first();
  await firstMission.check();
  await expect(firstMission).toBeChecked();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("vi-ready-guide-progress-v1:chapter3") ?? "[]"))).toEqual(["c3-01"]);

  await page.reload();
  await expect(checklist.getByRole("checkbox").first()).toBeChecked();
  const reset = checklist.getByRole("button");
  await reset.click();
  await expect(checklist.getByRole("checkbox").first()).toBeChecked();
  await reset.click();
  await expect(checklist.getByRole("checkbox").first()).not.toBeChecked();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("vi-ready-guide-progress-v1:chapter3") ?? "[]"))).toEqual([]);

  expect(requests.some((request) => request.startsWith("POST "))).toBe(false);
  expect(requests.some((request) => /c3-01|Welcome.to.Vice|progress|fingerprint|serial|renderer/i.test(request))).toBe(false);
  expect(errors).toEqual([]);
});

test("G03: corrupted progress and unknown mission IDs are ignored", async ({ page }) => {
  await page.goto("/gta-6-chapters/chapter-3/");
  await page.evaluate(() => {
    localStorage.setItem("vi-ready-guide-progress-v1:chapter3", JSON.stringify(["c3-01", "c3-01", "c4-01", "unknown", 7, null]));
    localStorage.setItem("vi-ready-guide-progress-v1:chapter4", "{broken");
  });
  await page.reload();
  const checklist = page.locator('[data-guide-page="chapter3"]');
  await expect(checklist.getByRole("checkbox").first()).toBeChecked();
  await expect(checklist.locator('input[type="checkbox"]:checked')).toHaveCount(1);
  expect(await checklist.getByRole("checkbox").evaluateAll((inputs) => inputs.filter((input) => (input as HTMLInputElement).checked).length)).toBe(1);
  await page.goto("/gta-6-chapters/chapter-4/");
  await expect(page.locator('[data-guide-page="chapter4"] input[type="checkbox"]:checked')).toHaveCount(0);
});

test("G04: Arabic chapter and money pages remain RTL without mobile overflow", async ({ page }) => {
  const errors = runtimeErrors(page);
  for (const path of ["/ar/فصول-gta-6/الفصل-3/", "/ar/مال-gta-6/"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
  expect(errors).toEqual([]);
});

test("G05: language switching preserves nested guide identity and query parameters", async ({ page }) => {
  await page.goto("/gta-6-chapters/chapter-3/?ref=guide");
  await page.getByLabel("Language", { exact: true }).selectOption("ar");
  await page.waitForURL((url) => decodeURI(url.pathname) === "/ar/فصول-gta-6/الفصل-3/" && url.search === "?ref=guide");
  expect(decodeURI(page.url())).toBe("http://127.0.0.1:4173/ar/فصول-gta-6/الفصل-3/?ref=guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GTA 6");
  await page.getByLabel("اللغة", { exact: true }).selectOption("es");
  await expect(page).toHaveURL(/\/es\/capitulos-gta-6\/capitulo-3\/\?ref=guide$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("G06: money page contains safe evidence links and an explicit distribution/T3 exclusion", async ({ page }) => {
  await page.goto("/gta-6-money/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Money");
  await expect(page.locator("tbody tr")).toHaveCount(guides.moneyMethods.length);
  await expect(page.locator("details")).toHaveCount(4);
  const hrefs = await page.locator("main a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  for (const href of hrefs) {
    expect(href).not.toMatch(/^(javascript|data|magnet):/i);
    expect(href).not.toMatch(/\.(exe|zip|rar|7z|iso)(?:$|[?#])/i);
    expect(href).not.toMatch(/torrent|private[-_ ]?server|t3[-_ ]?code/i);
    if (/^https?:\/\//.test(href)) expect(href.startsWith("https://")).toBe(true);
  }
  await expect(page.getByRole("heading", { name: /glitch/i })).toBeVisible();
  await expect(page.getByText(/provides no game files, cracks, private servers, or T3 code/i)).toBeVisible();
});

test("G07: homepage keeps the checker primary and links guides below it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Can I Run GTA 6?");
  await expect(page.getByRole("button", { name: "Check My PC" })).toBeVisible();
  const guidesSection = page.locator("section").filter({ has: page.locator("#home-guides-title") });
  await expect(guidesSection.getByRole("link")).toHaveCount(4);
  await expect(guidesSection.getByRole("link", { name: /chapters/i })).toHaveAttribute("href", "/gta-6-chapters/");
  await expect(guidesSection.getByRole("link", { name: /characters/i })).toHaveAttribute("href", "/characters/");
  await expect(guidesSection.getByRole("link", { name: /money/i })).toHaveAttribute("href", "/gta-6-money/");
  const checkerFirst = await page.locator("form").evaluate((form) => {
    const section = document.querySelector("#home-guides-title")?.closest("section");
    return section ? Boolean(form.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
  });
  expect(checkerFirst).toBe(true);
  await guidesSection.getByRole("link", { name: /vehicle trackers/i }).click();
  await expect(page).toHaveURL(/\/gta-6-vehicle-tracker\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Advanced Tracker");
});

test("map filters update the markers and list while preserving shareable destinations", async ({ page }) => {
  await page.goto("/leonida-map/#vice-city-gym");
  const article = page.locator("article");
  await expect(article.locator("section:target")).toHaveAttribute("id", "vice-city-gym");
  const filter = page.getByLabel("Filter locations");
  await filter.selectOption("island");
  await expect(article.locator('a[href="#vice-city-gym"]')).toHaveCount(0);
  await expect(article.locator('a[href="#starfish-island"]')).toHaveCount(2);
  await article.getByRole("link", { name: "Starfish Island", exact: true }).click();
  await expect(article.locator("section:target")).toHaveAttribute("id", "starfish-island");
  await filter.selectOption("");
  await expect(article.locator('a[href="#vice-city-gym"]')).toHaveCount(2);
});
