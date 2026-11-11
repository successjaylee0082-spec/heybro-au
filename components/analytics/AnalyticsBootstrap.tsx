"use client";

import { useEffect } from "react";
import Script from "next/script";
import { captureUtmAttribution } from "@/lib/analytics";

/**
 * Captures inbound UTM params into sessionStorage on first paint,
 * and optionally loads GA4 when a measurement id is provided.
 */
export function AnalyticsBootstrap({
  measurementId,
}: {
  measurementId?: string;
}) {
  useEffect(() => {
    captureUtmAttribution();
  }, []);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-bootstrap" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId.replace(/'/g, "")}', {
            anonymize_ip: true,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
