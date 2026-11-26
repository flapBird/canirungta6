import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import routes from "../../src/data/routes.json";

const origin = "https://canirungta6.online";

const corePaths = [
  "/",
  "/can-i-run-leonida/",
  "/gta-6-pc-requirements/",
  "/gta-6-pc/",
  "/es/",
  "/es/can-i-run-leonida/",
  "/es/requisitos-gta-6-pc/",
  "/es/gta-6-pc/",
  "/ar/",
  "/ar/can-i-run-leonida/",
  "/ar/gta-6-pc-requirements/",
  "/ar/gta-6-pc/",
];

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function selectHardware(page: Page, cpu: string, gpu: string): Promise<void> {
  const cpuInput = page.getByRole("combobox", { name: "Processor (CPU)" });
  await cpuInput.fill(cpu);
  await cpuInput.press("Enter");
  const gpuInput = page.getByRole("combobox", { name: "Graphics card (GPU)" });
  await gpuInput.fill(gpu);
  await gpuInput.press("Enter");
}

test("A01: all 12 core URLs export readable static HTML with navigation", async ({ request }) => {
  for (const path of corePaths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain("text/html");
    const html = await response.text();
    expect(html, path).toContain("<!DOCTYPE html>");
    expect(html, path).toContain("VI READY");
    expect(html, path).toContain('href="#main-content"');
    expect(html, path).toMatch(/<link[^>]+rel="stylesheet"/);
  }
});

test("A02: a new visitor sees an explicit empty state and usable navigation", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/");
  const result = page.locator('[aria-live="polite"]');
  await expect(result.getByRole("heading", { name: "Ready when you are" })).toBeVisible();
  await expect(result).not.toContainText("Not enough information");
  await expect(page.getByRole("button", { name: "Check My PC" })).toBeEnabled();
  const styles = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    headingSize: getComputedStyle(document.querySelector("h1")!).fontSize,
  }));
  expect(styles).toEqual({ background: "rgb(16, 16, 25)", headingSize: "48px" });
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Leonida", exact: true }).click();
  await expect(page).toHaveURL(/\/can-i-run-leonida\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Leonida");
  expect(errors).toEqual([]);
});

test("A03: RTX 3060 variants are separate and keyboard selection works", async ({ page }) => {
  await page.goto("/");
  const gpu = page.getByRole("combobox", { name: "Graphics card (GPU)" });
  await gpu.fill("3060");
  const options = page.getByRole("option");
  await expect(options.filter({ hasText: "RTX 3060 8GB" })).toBeVisible();
  await expect(options.filter({ hasText: "RTX 3060 12GB" })).toBeVisible();
  await expect(options.filter({ hasText: "RTX 3060 Laptop GPU" })).toBeVisible();
  await gpu.fill("RTX 3060 12GB");
  await gpu.press("Enter");
  await expect(gpu).toHaveValue("NVIDIA GeForce RTX 3060 12GB");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("A04/A05: software renderer and approximate RAM never guess a CPU", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "deviceMemory", { configurable: true, get: () => 8 });
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: function (contextId: string, ...args: unknown[]) {
        if (contextId === "webgl" || contextId === "webgl2") {
          return {
            getExtension(name: string) {
              if (name === "WEBGL_debug_renderer_info") return { UNMASKED_RENDERER_WEBGL: 0x9246 };
              if (name === "WEBGL_lose_context") return { loseContext() {} };
              return null;
            },
            getParameter() {
              return "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))";
            },
          };
        }
        return Reflect.apply(Object.getPrototypeOf(HTMLCanvasElement.prototype).getContext, this, [contextId, ...args]);
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Detect available hardware" }).click();
  await expect(page.getByText("A software or masked renderer was detected. It is not treated as a hardware model.")).toBeVisible();
  await expect(page.getByText(/Approximately 8 GB reported by the browser/)).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Processor (CPU)" })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Graphics card (GPU)" })).toHaveValue("");
  await page.getByRole("button", { name: "Check My PC" }).click();
  await expect(page.locator('form p[role="alert"]')).toContainText("confirm the detected values");
  await page.getByLabel("I confirm the detected values are reasonable").check();
  await page.getByRole("button", { name: "Check My PC" }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("No FPS estimate");
  expect(errors).toEqual([]);
});

test("A06: below-reference RAM is explained without an FPS promise", async ({ page }) => {
  await page.goto("/can-i-run-leonida/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("8");
  await page.getByLabel("Operating system").selectOption("windows11");
  await page.getByLabel("CPU architecture").selectOption("x64");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();
  const result = page.locator('[aria-live="polite"]');
  await expect(result).toContainText("Below the recorded historical RAM reference.");
  await expect(result).toContainText("No FPS estimate. No measured game benchmark is available.");
  await expect(result).toContainText("Not verified");
});

test("Report, copied link and PNG keep the submitted hardware until the next check", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/can-i-run-leonida/");
  const ram = page.getByLabel("Memory (RAM)");
  const check = page.getByRole("button", { name: "Check Leonida compatibility" });
  const report = page.locator('[aria-live="polite"]');
  const reportImage = async () => {
    const pending = page.waitForEvent("download");
    await report.getByRole("button", { name: "Download PNG" }).click();
    const download = await pending;
    return readFile((await download.path())!);
  };

  await ram.selectOption("8");
  await check.click();
  await expect(report.getByRole("heading", { name: "Leonida historical hardware comparison" })).toBeVisible();
  await expect(report).toContainText("Leonida playability");
  await expect(report).not.toContainText("Official PC availability");
  const submittedUrl = page.url();
  const submittedImage = await reportImage();

  await ram.selectOption("32");
  await expect(report.getByText("8 GB", { exact: true })).toBeVisible();
  await expect(report).toContainText("Below the recorded historical RAM reference.");
  await report.getByRole("button", { name: "Copy result link" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(submittedUrl);
  expect((await reportImage()).equals(submittedImage)).toBe(true);

  await check.click();
  await expect(report.getByText("32 GB", { exact: true })).toBeVisible();
  await expect(report).toContainText("Meets the recorded historical RAM reference.");
  expect(new URL(page.url()).searchParams.get("ram")).toBe("32");
  await report.getByRole("button", { name: "Copy result link" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
  expect((await reportImage()).equals(submittedImage)).toBe(false);
});

test("A07: desktop GPUs receive a console estimate without a PC benchmark", async ({ page }) => {
  await page.goto("/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("32");
  await page.getByRole("button", { name: "Check My PC" }).click();
  const result = page.locator('[aria-live="polite"]');
  await expect(result).toContainText("GPU near console reference");
  await expect(result).toContainText("No verified GTA 6 CPU reference or benchmark exists.");
  await expect(result).toContainText("No GTA VI PC game benchmark is available");
});

test("A08: a full Leonida hardware match still has no verified playable build", async ({ page }) => {
  await page.goto("/can-i-run-leonida/");
  await page.getByLabel("Historical reference tier").selectOption("leonida-console-comparable-historical");
  await selectHardware(page, "Ryzen 7 3700X", "RTX 3070");
  await page.getByLabel("Memory (RAM)").selectOption("32");
  await page.getByLabel("Operating system").selectOption("windows11");
  await page.getByLabel("CPU architecture").selectOption("x64");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();
  const result = page.locator('[aria-live="polite"]');
  await expect(result).toContainText("Not verified");
  await expect(result).toContainText("Not enough information");
  await expect(result).toContainText("Historical reference result: Unknown");
  await expect(result.getByText(/Meets reference$/)).toHaveCount(5);
  await expect(result).toContainText("No FPS estimate");
});

test("A09: OS and Vulkan evidence remain independently Unknown", async ({ page }) => {
  await page.goto("/can-i-run-leonida/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("16");
  await page.getByLabel("Operating system").selectOption("linux");
  await page.getByLabel("CPU architecture").selectOption("x64");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();
  const result = page.locator('[aria-live="polite"]');
  await expect(result).toContainText("Linux native support is not established");
  await expect(result).toContainText("Browser APIs cannot verify actual Vulkan driver features");
  await expect(result).toContainText("Driver features remain Unknown");
});

test("A10: shared URLs restore configuration and hostile values fall back safely", async ({ page, context }) => {
  await page.goto("/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("16");
  await page.getByLabel("Operating system").selectOption("windows11");
  await page.getByLabel("CPU architecture").selectOption("x64");
  await page.getByLabel("Storage type").selectOption("ssd");
  await page.getByLabel("Free disk space (GB)").fill("500");
  await page.getByLabel("Target resolution").selectOption("1440p");
  await page.getByRole("button", { name: "Check My PC" }).click();
  const sharedUrl = page.url();
  expect(sharedUrl).toContain("cpu=intel-core-i5-12400f");
  expect(sharedUrl).toContain("gpu=nvidia-rtx-3060-12gb-desktop");

  const reopened = await context.newPage();
  await reopened.goto(sharedUrl);
  await expect(reopened.getByLabel("Processor (CPU)")).toHaveValue("Intel Core i5-12400F");
  await expect(reopened.getByLabel("Graphics card (GPU)")).toHaveValue("NVIDIA GeForce RTX 3060 12GB");
  await expect(reopened.getByLabel("Memory (RAM)")).toHaveValue("16");
  await expect(reopened.getByLabel("Target resolution")).toHaveValue("1440p");

  await reopened.goto("/?cpu=%3Cscript%3E&gpu=not-real&ram=99999&vram=-8&os=plan9&arch=x86&resolution=8k&renderer=secret");
  await expect(reopened.getByLabel("Processor (CPU)")).toHaveValue("");
  await expect(reopened.getByLabel("Graphics card (GPU)")).toHaveValue("");
  await expect(reopened.getByLabel("Memory (RAM)")).toHaveValue("unknown");
  await expect(reopened.getByLabel("Operating system")).toHaveValue("unknown");
});

test("A11: language switching preserves the business page and legal configuration", async ({ page }) => {
  await page.goto("/can-i-run-leonida/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("16");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();
  const query = new URL(page.url()).search;

  await page.getByLabel("Language").selectOption("ar");
  await expect(page).toHaveURL(/\/ar\/can-i-run-leonida\/\?/);
  expect(new URL(page.url()).search).toBe(query);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Leonida");
  await expect(page.locator("#cpu")).toHaveValue("Intel Core i5-12400F");

  await page.getByLabel("اللغة").selectOption("es");
  await expect(page).toHaveURL(/\/es\/can-i-run-leonida\/\?/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("#gpu")).toHaveValue("NVIDIA GeForce RTX 3060 12GB");
});

test("A12: Arabic static HTML is RTL and hardware names remain LTR without overflow", async ({ page, request }) => {
  const response = await request.get("/ar/?cpu=intel-core-i5-12400f&gpu=nvidia-rtx-3060-12gb-desktop");
  const html = await response.text();
  expect(html).toMatch(/<html[^>]+lang="ar"[^>]+dir="rtl"|<html[^>]+dir="rtl"[^>]+lang="ar"/);
  await page.goto("/ar/?cpu=intel-core-i5-12400f&gpu=nvidia-rtx-3060-12gb-desktop");
  await expect(page.locator("#cpu")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("#gpu")).toHaveAttribute("dir", "ltr");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("A13: 320–1440px layouts avoid horizontal overflow and keep controls operable", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/");
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("button", { name: "Check My PC" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `width ${width}`).toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Leonida", exact: true }).click();
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("16");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();
  await expect(page.locator('[aria-live="polite"]')).toBeInViewport();
  expect(errors).toEqual([]);
});

test("A14: parameterized ES/AR pages keep clean self-language canonical and hreflang", async ({ request }) => {
  for (const [path, canonical, language] of [
    ["/es/can-i-run-leonida/?cpu=intel-core-i5-12400f", "https://canirungta6.online/es/can-i-run-leonida/", "es"],
    ["/ar/can-i-run-leonida/?gpu=nvidia-rtx-3060-12gb-desktop", "https://canirungta6.online/ar/can-i-run-leonida/", "ar"],
  ] as const) {
    const html = await (await request.get(path)).text();
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
    expect(html).not.toContain('hrefLang="ar"');
    if (language === "es") expect(html).toContain(`<link rel="alternate" hrefLang="${language}" href="${canonical}"`);
    expect(html).toContain('<link rel="alternate" hrefLang="en" href="https://canirungta6.online/can-i-run-leonida/"');
    expect(html).not.toContain('<link rel="canonical" href="https://canirungta6.online/es/can-i-run-leonida/?');
    expect(html).not.toContain('<meta name="robots" content="noindex');
  }
});

test("A15: sitemap and robots expose only real indexable paths", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(locations).toHaveLength(40);
  expect(new Set(locations).size).toBe(40);
  expect(locations.every((url) => !url.includes("?"))).toBe(true);
  expect(locations.every((url) => url.startsWith(origin))).toBe(true);
  expect(sitemap).not.toContain("vi-ready.pages.dev");
  expect(locations.some((url) => new URL(url).pathname.startsWith("/ar/"))).toBe(false);
  for (const path of corePaths.filter((url) => !url.startsWith("/ar/"))) {
    expect(locations).toContain(`${origin}${path}`);
  }
  for (const page of ["privacy", "terms", "cookies"] as const) {
    for (const locale of ["en", "es"] as const) {
      expect(locations).toContain(`${origin}/${routes[page][locale]}/`);
    }
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("User-agent: *");
  expect(robots).toContain("Allow: /");
  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(robots).not.toContain("Disallow:");
});

test("A16: local testing sends no analytics requests and shows no consent prompt", async ({ page }) => {
  const requests: string[] = [];
  const errors = collectRuntimeErrors(page);
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()}`));
  await page.addInitScript(() => localStorage.setItem("vi-ready-analytics-consent-v1", "granted"));
  await page.goto("/");
  await selectHardware(page, "Core i5-12400F", "RTX 3060 12GB");
  await page.getByLabel("Memory (RAM)").selectOption("16");
  await page.getByRole("button", { name: "Check My PC" }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("GPU near console reference");
  await expect(page.getByRole("heading", { name: "Optional analytics" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Accept optional analytics" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Decline" })).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager.com/gtm.js"]')).toHaveCount(0);
  await expect(page.locator('script[src*="google-analytics.com"]')).toHaveCount(0);
  await expect(page.locator('script[src*="clarity.ms"]')).toHaveCount(0);
  expect(requests.some((request) => /googletagmanager|google-analytics|clarity\.ms/.test(request))).toBe(false);
  expect(requests.some((request) => request.startsWith("POST "))).toBe(false);
  expect(requests.some((request) => /serial|renderer|machine|fingerprint/i.test(request))).toBe(false);
  expect(errors).toEqual([]);
});

test("A17: all localized legal pages expose complete policies, contact links, and the production domain", async ({ page, request }) => {
  const legalPages = ["privacy", "terms", "cookies"] as const;
  const locales = ["en", "es", "ar"] as const;
  for (const legalPage of legalPages) {
    for (const locale of locales) {
      const path = `/${encodeURI(routes[legalPage][locale])}/`;
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      const canonical = `${origin}${path}`;
      expect(html, path).toContain(`<link rel="canonical" href="${canonical}"`);
      expect(html, path).toContain(`<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"`);
      expect(html, path).toContain("2026-11-24");
      expect(html, path).toContain('href="mailto:support@canirungta6.online"');
      expect(html, path).toContain(`href="/${routes[legalPage][locale]}/"`);
      expect(html, path).toContain(`href="/${routes.privacy[locale]}/"`);
      expect(html, path).toContain(`href="/${routes.terms[locale]}/"`);
      expect(html, path).toContain(`href="/${routes.cookies[locale]}/"`);
      expect(html, path).not.toContain("vi-ready.pages.dev");
      expect(html, path).not.toContain('<meta name="robots" content="noindex');
    }
  }

  const errors = collectRuntimeErrors(page);
  await page.goto(`/${encodeURI(routes.terms.ar)}/`);
  await expect(page.getByRole("heading", { level: 1, name: "شروط الاستخدام" })).toBeVisible();
  const footer = page.locator("footer");
  const email = footer.getByRole("link", { name: /support@canirungta6\.online/ });
  await expect(email).toHaveAttribute("href", "mailto:support@canirungta6.online");
  await expect(email).toHaveAttribute("dir", "ltr");
  await expect(footer.getByRole("link", { name: "سياسة ملفات تعريف الارتباط", exact: true })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `Arabic terms width ${width}`).toBeLessThanOrEqual(1);
  }
  expect(errors).toEqual([]);
});

test("A19: inaccessible Leonida evidence stays stale with its last check date", async ({ page }) => {
  await page.goto("/can-i-run-leonida/");
  await expect(page.getByText("Not verified", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Access unconfirmed (404)", { exact: true })).toBeVisible();
  await expect(page.getByText("Stale", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Unavailable", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("2026-11-24", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/original source returned 403/)).toBeVisible();
});

test("A21: upgrade simulation preserves the baseline and recalculates the same profile", async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/can-i-run-leonida/");
  await selectHardware(page, "Ryzen 7 7800X3D", "RTX 5070");
  await page.getByLabel("Memory (RAM)").selectOption("8");
  await page.getByLabel("Operating system").selectOption("windows11");
  await page.getByLabel("CPU architecture").selectOption("x64");
  await page.getByRole("button", { name: "Check Leonida compatibility" }).click();

  const simulator = page.getByRole("region", { name: "What Should I Upgrade?" });
  await simulator.getByRole("combobox", { name: "Simulated CPU" }).fill("Core i5-12400F");
  await simulator.getByRole("combobox", { name: "Simulated CPU" }).press("Enter");
  await simulator.getByRole("combobox", { name: "Simulated GPU" }).fill("RTX 3060 12GB");
  await simulator.getByRole("combobox", { name: "Simulated GPU" }).press("Enter");
  await simulator.getByLabel("Simulated RAM").selectOption("16");
  await simulator.getByRole("button", { name: "Compare upgrade" }).click();

  await expect(simulator).toContainText("leonida-1080p-low-historical · historical-2026-11-24.1");
  await expect(simulator).toContainText("No FPS or percentage performance improvement is estimated.");
  await expect(simulator).toContainText("Motherboard, socket, power supply");
  for (const component of ["Processor", "Graphics card", "Memory"]) {
    const row = simulator.getByRole("row").filter({ hasText: component });
    await expect(row).toContainText("Meets reference");
  }
  await expect(page.getByRole("combobox", { name: "Processor (CPU)" })).toHaveValue("AMD Ryzen 7 7800X3D");
  await expect(page.getByRole("combobox", { name: "Graphics card (GPU)" })).toHaveValue("NVIDIA GeForce RTX 5070");
  await expect(page.getByLabel("Memory (RAM)")).toHaveValue("8");
  await simulator.getByRole("button", { name: "Reset simulation" }).click();
  await expect(simulator.getByRole("combobox", { name: "Simulated CPU" })).toHaveValue("AMD Ryzen 7 7800X3D");
  expect(errors).toEqual([]);
});

test("A22: DxDiag stays local and PNG sharing works in all three languages", async ({ page }) => {
  const requests: string[] = [];
  const errors = collectRuntimeErrors(page);
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.postData() ?? ""}`));
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "DxDiag.txt",
    mimeType: "text/plain",
    buffer: Buffer.from([
      "------------------", "System Information", "------------------",
      "Machine Name: SECRET-MACHINE", "Serial Number: SECRET-SERIAL",
      "Processor name: Intel(R) Core(TM) i5-12400F CPU @ 2.50GHz", "Memory: 16384MB RAM",
      "------------------", "Display Devices", "------------------", "Name: NVIDIA GeForce RTX 3060 12GB",
    ].join("\r\n")),
  });
  await expect(page.getByText("Recognized local values")).toBeVisible();
  await page.getByRole("button", { name: "Apply recognized values" }).click();
  await expect(page.getByRole("combobox", { name: "Processor (CPU)" })).toHaveValue("Intel Core i5-12400F");
  await expect(page.getByRole("combobox", { name: "Graphics card (GPU)" })).toHaveValue("NVIDIA GeForce RTX 3060 12GB");
  await expect(page.getByLabel("Memory (RAM)")).toHaveValue("16");
  await expect(page.locator("body")).not.toContainText("SECRET");

  for (const [index, locale] of (["en", "es", "ar"] as const).entries()) {
    if (index > 0) {
      await page.locator("select").filter({ has: page.locator('option[value="' + locale + '"]') }).first().selectOption(locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("combobox", { name: /Processor|Procesador|المعالج/ })).toHaveValue("Intel Core i5-12400F");
    }
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole("button", { name: /Copy result link|Copiar enlace del resultado|نسخ رابط النتيجة/ })).toBeVisible();
    const downloadButton = page.getByRole("button", { name: /Download PNG|Descargar PNG|تنزيل PNG/ });
    await expect(downloadButton).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await downloadButton.click();
    const download = await downloadPromise;
    const path = `test-results/share-${locale}.png`;
    await download.saveAs(path);
    const png = await readFile(path);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(png.byteLength).toBeGreaterThan(10_000);
  }

  expect(requests.some((request) => request.startsWith("POST "))).toBe(false);
  expect(requests.some((request) => /SECRET|serial|machine|fingerprint/i.test(request))).toBe(false);
  expect(errors).toEqual([]);
});

test("Port comparison, official news and hardware forecasts have distinct content", async ({ page }) => {
  await page.goto("/gta-6-port/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Unofficial");
  for (const project of ["VIctory", "XCL", "Leonida"]) {
    await expect(page.getByRole("rowheader", { name: project, exact: true })).toBeVisible();
  }
  await page.getByRole("article").getByRole("link", { name: "GTA 6 PC Release News and Announcement Timeline" }).click();
  await expect(page.locator("article time")).toHaveCount(3);
  await expect(page.locator("article table")).toHaveCount(0);
  await page.getByRole("article").getByRole("link", { name: /Requirements Forecast/ }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("link", { name: "AMD Radeon RX 6600", exact: true }).click();
  await page.getByRole("button", { name: "Check My PC" }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("GPU below console reference");
});

test("Port navigation, breadcrumb text alignment and grouped footer work at both header breakpoints", async ({ page }) => {
  for (const locale of ["en", "es", "ar"] as const) {
    const portPath = `/${routes.port[locale]}/`;
    for (const width of [320, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${routes.requirements[locale]}/`);
      const header = page.locator("header").first();
      if (width >= 1024) await expect(header.locator("button")).toBeHidden();
      if (width < 1024) await header.getByRole("button").click();
      const port = header.locator(`nav:visible a[href="${portPath}"]`);
      await expect(port).toBeVisible();
      await port.click();

      if (width < 1024) await header.getByRole("button").click();
      await expect(port).toHaveAttribute("aria-current", "page");
      const offsets = await page.locator('nav:has([aria-current="page"])').filter({ has: page.locator('span[aria-current="page"]') }).evaluate((nav) => {
        return [...nav.querySelectorAll("a, [aria-hidden], [aria-current]")].map((item) => {
          const range = document.createRange();
          range.selectNodeContents(item);
          const rect = range.getBoundingClientRect();
          return rect.y + rect.height / 2;
        });
      });
      expect(Math.max(...offsets) - Math.min(...offsets)).toBeLessThanOrEqual(2);
      const footer = page.locator("footer nav");
      await expect(footer.getByRole("list")).toHaveCount(3);
      await expect(footer.getByRole("link")).toHaveCount(14);
      await expect(footer.locator(`a[href="${portPath}"]`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  }
});
