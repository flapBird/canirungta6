"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { CLARITY_PROJECT_ID, GTM_CONTAINER_ID, cleanAnalyticsLocation, isProductionAnalyticsLocation } from "@/lib/analytics";

function subscribeLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

export function Analytics() {
  const productionHost = useSyncExternalStore(subscribeLocation, () => isProductionAnalyticsLocation(window.location.href), () => false);

  if (!productionHost) return null;

  return (
    <>
      <Script id="gtm-loader" src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_CONTAINER_ID)}`} strategy="afterInteractive" />
      <Script id="gtm-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        window.dataLayer.push({ event: 'vi_ready_page_view', page_location: ${JSON.stringify(cleanAnalyticsLocation())} });
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        window.gtmContainerId = ${JSON.stringify(GTM_CONTAINER_ID)};
      `}</Script>
      {CLARITY_PROJECT_ID && (
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,z){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;z=l.getElementsByTagName(r)[0];z.parentNode.insertBefore(t)})(window,document,'clarity','script',${JSON.stringify(CLARITY_PROJECT_ID)});
        `}</Script>
      )}
    </>
  );
}
