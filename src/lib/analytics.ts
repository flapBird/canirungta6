export const PRODUCTION_ANALYTICS_ORIGIN = "https://canirungta6.online";
export const GTM_CONTAINER_ID = "GTM-PFZF34QK";
export const CLARITY_PROJECT_ID = "";

type AnalyticsParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtmContainerId?: string;
  }
}

export function isProductionAnalyticsLocation(href: string): boolean {
  try {
    return new URL(href).origin === PRODUCTION_ANALYTICS_ORIGIN;
  } catch {
    return false;
  }
}

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined" || !isProductionAnalyticsLocation(window.location.href)) return;
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
