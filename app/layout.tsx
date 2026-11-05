import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { PwaRegistration } from "@/components/layout/PwaRegistration";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getRequestLocale } from "@/lib/i18n-server";
/* Tailwind base/components/utilities live in globals.css; navigation.css adds shell/gate layout. */
import "./globals.css";
import "./navigation.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const title =
    locale === "zh"
      ? "Hey Bro｜澳大利亚夜生活指南"
      : "Hey Bro - Your Ultimate Aussie Nightlife Guide";
  const description =
    locale === "zh"
      ? "探索澳大利亚的夜生活、出行与实用本地信息。"
      : "Discover Australia after dark with Hey Bro. Explore nightlife in Sydney, Melbourne, Brisbane, Perth, Gold Coast and Adelaide.";
  return {
    title: { default: title, template: "%s" },
    description,
    applicationName: "Hey Bro",
    robots: { index: false, follow: true },
    manifest: "/manifest.webmanifest",
    keywords: [
      "Australian nightlife",
      "nightlife guide",
      "Sydney",
      "Melbourne",
      "Hey Bro",
    ],
    openGraph: {
      title,
      description,
      siteName: "Hey Bro",
      locale: locale === "zh" ? "zh_CN" : "en_AU",
      type: "website",
    },
    twitter: { card: "summary", title, description },
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
export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getRequestLocale();
  return (
    <html
      lang={locale === "zh" ? "zh-Hans" : "en-AU"}
      className={`dark ${display.variable} ${sans.variable}`}
    >
      <body
        className={`${sans.className} min-h-screen bg-background text-foreground antialiased luxury-shell`}
      >
        <PwaRegistration />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
