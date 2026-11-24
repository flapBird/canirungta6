export const CONSENT_KEY = "vi-ready-analytics-consent-v1";
export const PRODUCTION_ANALYTICS_ORIGIN = "https://canirungta6.online";

type AnalyticsParams = Record<string, string | number | boolean>;
type AnalyticsConsent = "granted" | "denied" | null;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtmContainerId?: string;
  }
}

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getAnalyticsConsent() === "granted";
}

export function setAnalyticsConsent(granted: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent("analytics-consent-changed"));
}

export function isProductionAnalyticsLocation(href: string): boolean {
  try {
    return new URL(href).origin === PRODUCTION_ANALYTICS_ORIGIN;
  } catch {
    return false;
  }
}

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined" || !isProductionAnalyticsLocation(window.location.href) || !hasAnalyticsConsent()) return;
  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => ["string", "number", "boolean"].includes(typeof value)),
  );
  const eventParams = { ...safeParams, page_location: cleanAnalyticsLocation() };
  if (window.gtmContainerId) {
    window.dataLayer?.push({ event: name, ...eventParams });
    return;
  }
  window.gtag?.("event", name, eventParams);
}

export function cleanAnalyticsLocation(href = window.location.href): string {
  const url = new URL(href);
  url.search = "";
  url.hash = "";
  return url.toString();
}
