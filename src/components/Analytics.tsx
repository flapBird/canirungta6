"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { cleanAnalyticsLocation, getAnalyticsConsent, isProductionAnalyticsLocation, setAnalyticsConsent } from "@/lib/analytics";
import { localePath } from "@/lib/i18n-routes";
import type { Dictionary, Locale } from "@/lib/types";

function subscribe(callback: () => void) {
  window.addEventListener("analytics-consent-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("analytics-consent-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

export function Analytics({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const consent = useSyncExternalStore(subscribe, getAnalyticsConsent, () => null);
  const productionHost = useSyncExternalStore(subscribeLocation, () => isProductionAnalyticsLocation(window.location.href), () => false);
  const configured = Boolean(gaId || gtmId || clarityId);
  const visible = configured && productionHost && consent === null;

  if (!configured || !productionHost) return null;

  return (
    <>
      {consent === "granted" && gtmId && (
        <>
          <Script id="gtm-loader" src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`} strategy="afterInteractive" />
          <Script id="gtm-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            window.dataLayer.push({ event: 'vi_ready_page_view', page_location: ${JSON.stringify(cleanAnalyticsLocation())} });
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            window.gtmContainerId = ${JSON.stringify(gtmId)};
          `}</Script>
        </>
      )}
      {consent === "granted" && !gtmId && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', ${JSON.stringify(gaId)}, { send_page_view: false, allow_google_signals: false });
            gtag('event', 'page_view', { page_location: ${JSON.stringify(cleanAnalyticsLocation())} });
          `}</Script>
        </>
      )}
      {consent === "granted" && clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,z){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;z=l.getElementsByTagName(r)[0];z.parentNode.insertBefore(t)})(window,document,'clarity','script',${JSON.stringify(clarityId)});
        `}</Script>
      )}
      {visible && (
        <aside className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-[#1c1c2a] p-5 shadow-2xl" data-clarity-mask="true" aria-label={dictionary.support.privacyTitle}>
          <p className="font-extrabold">{dictionary.support.privacyAnalyticsTitle}</p>
          <p className="mt-1 text-sm text-muted">{dictionary.support.privacyAnalytics}</p>
          <nav className="mt-3 flex flex-wrap gap-x-4 text-sm font-bold" aria-label={dictionary.support.legalPagesLabel}>
            <a href={localePath("privacy", locale)} className="min-h-11 py-2 text-accent hover:underline"><bdi>{dictionary.support.privacyTitle}</bdi></a>
            <a href={localePath("cookies", locale)} className="min-h-11 py-2 text-accent hover:underline"><bdi>{dictionary.support.cookiesTitle}</bdi></a>
          </nav>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={() => setAnalyticsConsent(true)}>{dictionary.common.acceptAnalytics}</button>
            <button type="button" className="btn-secondary" onClick={() => setAnalyticsConsent(false)}>{dictionary.common.declineAnalytics}</button>
          </div>
        </aside>
      )}
    </>
  );
}
