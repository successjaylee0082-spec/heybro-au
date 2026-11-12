import "./globals.css";
import "./navigation.css";
import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { AnalyticsBootstrap } from "@/components/analytics/AnalyticsBootstrap";
import { PwaRegistration } from "@/components/layout/PwaRegistration";
import { getRequestLocale } from "@/lib/i18n-server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://heybro.au";

const GA_MEASUREMENT_ID =
  process.env.GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  undefined;

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title = "Hey Bro — Verified Aussie Nightlife Directory";
  const description =
    "Dark luxury nightlife directory for Sydney and Melbourne — verified venues, live companion lineups, and discreet direct booking.";
  const ogImage = `${SITE_URL}/images/hero/studio-silhouette.jpg`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · Hey Bro" },
    description,
    applicationName: "Hey Bro",
    robots: { index: false, follow: true },
    manifest: "/manifest.webmanifest",
    keywords: [
      "Australian nightlife",
      "Sydney brothels",
      "Melbourne escorts",
      "verified venues",
      "Hey Bro",
      "Reddit nightlife",
    ],
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "Hey Bro",
      locale: locale === "zh" ? "zh_CN" : "en_AU",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Hey Bro — dark luxury Australian nightlife directory",
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "theme-color": "#060709",
      "color-scheme": "dark",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Hey Bro",
    },
  };
}
export const viewport: Viewport = {
  themeColor: "#060709",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Root layout — Google Fonts load via <link> (no next/font server fetch).
 * Preserves --font-display / --font-sans CSS variables used across the theme.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getRequestLocale();
  return (
    <html
      lang={locale === "zh" ? "zh-Hans" : "en-AU"}
      className="dark"
      style={
        {
          ["--font-display"]:
            '"Cormorant Garamond", Georgia, "Times New Roman", serif',
          ["--font-sans"]:
            '"Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
        } as CSSProperties
      }
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased luxury-shell">
        <AnalyticsBootstrap measurementId={GA_MEASUREMENT_ID} />
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
