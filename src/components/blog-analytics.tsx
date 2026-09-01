"use client";

import Script from "next/script";
import { useEffect } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackBlogEvent(name: string, params: Record<string, string>) {
  window.gtag?.("event", name, params);
}

export function BlogAnalytics() {
  useEffect(() => {
    if (!measurementId) return;
    window.gtag?.("config", measurementId, { anonymize_ip: true });
  }, []);

  if (!measurementId) return null;
  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    </>
  );
}
