import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GTM_CONTAINER_ID,
  PRODUCTION_ANALYTICS_ORIGIN,
  cleanAnalyticsLocation,
  isProductionAnalyticsLocation,
  trackEvent,
} from "@/lib/analytics";

function mockBrowser(href: string, legacyConsent: string | null = null) {
  const values = new Map<string, string>();
  if (legacyConsent !== null) values.set("vi-ready-analytics-consent-v1", legacyConsent);
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
  const browser: {
    location: { href: string };
    dataLayer: unknown[];
    gtmContainerId?: string;
    gtag?: (...args: unknown[]) => void;
  } = {
    location: { href },
    dataLayer: [],
  };
  vi.stubGlobal("window", browser);
  vi.stubGlobal("localStorage", storage);
  return { browser, storage };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("analytics origin", () => {
  it("ships the supplied GTM container and allows only the exact HTTPS production origin", () => {
    expect(GTM_CONTAINER_ID).toBe("GTM-PFZF34QK");
    expect(PRODUCTION_ANALYTICS_ORIGIN).toBe("https://canirungta6.online");
    expect(isProductionAnalyticsLocation("https://canirungta6.online/")).toBe(true);
    expect(isProductionAnalyticsLocation("https://canirungta6.online/gta-6-pc/?cpu=test#result")).toBe(true);
    expect(isProductionAnalyticsLocation("http://localhost:3000/")).toBe(false);
    expect(isProductionAnalyticsLocation("http://127.0.0.1:4173/")).toBe(false);
    expect(isProductionAnalyticsLocation("https://preview.canirungta6.pages.dev/")).toBe(false);
    expect(isProductionAnalyticsLocation("http://canirungta6.online/")).toBe(false);
    expect(isProductionAnalyticsLocation("https://canirungta6.online.example.com/")).toBe(false);
    expect(isProductionAnalyticsLocation("https://canirungta6.online@evil.example/")).toBe(false);
    expect(isProductionAnalyticsLocation("not a URL")).toBe(false);
  });

  it("removes query strings and hashes from analytics page locations", () => {
    expect(cleanAnalyticsLocation("https://canirungta6.online/gta-6-pc/?cpu=secret&gpu=secret#result")).toBe("https://canirungta6.online/gta-6-pc/");
    expect(cleanAnalyticsLocation("https://canirungta6.online/?cpu=secret#result")).toBe("https://canirungta6.online/");
  });
});

describe("analytics event dispatch", () => {
  it("does not send events from local hosts even with a legacy granted consent value", () => {
    const { browser, storage } = mockBrowser("http://127.0.0.1:4173/", "granted");
    browser.gtmContainerId = GTM_CONTAINER_ID;
    trackEvent("checker_completed", { profile: "gta6-unknown" });
    expect(browser.dataLayer).toEqual([]);
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it("ignores legacy consent choices on the production origin", () => {
    const { browser, storage } = mockBrowser("https://canirungta6.online/", "denied");
    browser.gtmContainerId = GTM_CONTAINER_ID;
    trackEvent("checker_completed", { profile: "gta6-unknown" });
    expect(browser.dataLayer).toEqual([{
      event: "checker_completed",
      profile: "gta6-unknown",
      page_location: "https://canirungta6.online/",
    }]);
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it("uses sanitized GTM dataLayer events on the production origin", () => {
    const { browser } = mockBrowser("https://canirungta6.online/gta-6-pc/?cpu=secret#result");
    browser.gtmContainerId = GTM_CONTAINER_ID;
    trackEvent("checker_completed", { profile: "gta6-unknown", estimated: false });
    expect(browser.dataLayer).toEqual([{
      event: "checker_completed",
      profile: "gta6-unknown",
      estimated: false,
      page_location: "https://canirungta6.online/gta-6-pc/",
    }]);
  });

  it("uses an available gtag queue when GTM has not initialized", () => {
    const { browser } = mockBrowser("https://canirungta6.online/?cpu=secret");
    const gtag = vi.fn();
    browser.gtag = gtag;
    trackEvent("checker_completed", { profile: "leonida-historical" });
    expect(gtag).toHaveBeenCalledWith("event", "checker_completed", {
      profile: "leonida-historical",
      page_location: "https://canirungta6.online/",
    });
  });

  it("does nothing during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackEvent("checker_completed")).not.toThrow();
  });
});
