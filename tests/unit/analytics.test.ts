import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_KEY,
  PRODUCTION_ANALYTICS_ORIGIN,
  cleanAnalyticsLocation,
  getAnalyticsConsent,
  isProductionAnalyticsLocation,
  setAnalyticsConsent,
  trackEvent,
} from "@/lib/analytics";

function mockBrowser(href: string, consent: string | null = null) {
  const values = new Map<string, string>();
  if (consent !== null) values.set(CONSENT_KEY, consent);
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
  const browser: {
    location: { href: string };
    dataLayer: unknown[];
    dispatchEvent: ReturnType<typeof vi.fn>;
    gtmContainerId?: string;
    gtag?: (...args: unknown[]) => void;
  } = {
    location: { href },
    dataLayer: [],
    dispatchEvent: vi.fn(),
  };
  vi.stubGlobal("window", browser);
  vi.stubGlobal("localStorage", storage);
  return { browser, storage, values };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("analytics origin and consent", () => {
  it("allows only the exact HTTPS production origin", () => {
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

  it("distinguishes no choice, rejection, and acceptance", () => {
    mockBrowser("https://canirungta6.online/");
    expect(getAnalyticsConsent()).toBeNull();
    setAnalyticsConsent(true);
    expect(getAnalyticsConsent()).toBe("granted");
    setAnalyticsConsent(false);
    expect(getAnalyticsConsent()).toBe("denied");
  });

  it("treats unknown or unavailable consent storage as no choice", () => {
    mockBrowser("https://canirungta6.online/", "unexpected");
    expect(getAnalyticsConsent()).toBeNull();
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage blocked");
      },
    });
    expect(getAnalyticsConsent()).toBeNull();
  });

  it("removes query strings and hashes from analytics page locations", () => {
    expect(cleanAnalyticsLocation("https://canirungta6.online/gta-6-pc/?cpu=secret&gpu=secret#result")).toBe("https://canirungta6.online/gta-6-pc/");
    expect(cleanAnalyticsLocation("https://canirungta6.online/?cpu=secret#result")).toBe("https://canirungta6.online/");
  });
});

describe("analytics event dispatch", () => {
  it("does not send events from local hosts even with granted consent", () => {
    const { browser } = mockBrowser("http://127.0.0.1:4173/", "granted");
    browser.gtmContainerId = "GTM-TEST";
    trackEvent("checker_completed", { profile: "gta6-unknown" });
    expect(browser.dataLayer).toEqual([]);
  });

  it("does not send events from production without granted consent", () => {
    const { browser } = mockBrowser("https://canirungta6.online/", "denied");
    browser.gtmContainerId = "GTM-TEST";
    trackEvent("checker_completed", { profile: "gta6-unknown" });
    expect(browser.dataLayer).toEqual([]);
  });

  it("uses sanitized GTM dataLayer events after production consent", () => {
    const { browser } = mockBrowser("https://canirungta6.online/gta-6-pc/?cpu=secret#result", "granted");
    browser.gtmContainerId = "GTM-TEST";
    trackEvent("checker_completed", { profile: "gta6-unknown", estimated: false });
    expect(browser.dataLayer).toEqual([{
      event: "checker_completed",
      profile: "gta6-unknown",
      estimated: false,
      page_location: "https://canirungta6.online/gta-6-pc/",
    }]);
  });

  it("falls back to direct GA4 only when GTM is not configured", () => {
    const { browser } = mockBrowser("https://canirungta6.online/?cpu=secret", "granted");
    const gtag = vi.fn();
    Object.assign(browser, { gtag });
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
