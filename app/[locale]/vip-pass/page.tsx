import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "VIP Night Pass — 50% Off Club Entry | Hey Bro Australia",
  description:
    "Show your Hey Bro VIP Pass at the door for exclusive 50% off entry at top Melbourne & Sydney clubs.",
  alternates: {
    canonical: `${getSiteUrl()}/vip-pass`,
  },
  openGraph: {
    title: "VIP Night Pass — 50% Off Club Entry | Hey Bro Australia",
    description:
      "Show your Hey Bro VIP Pass at the door for exclusive 50% off entry at top Melbourne & Sydney clubs.",
    url: `${getSiteUrl()}/vip-pass`,
    siteName: "Hey Bro",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const PARTNER_CLUBS = [
  {
    id: "king-st-1",
    city: "Melbourne",
    name: "King Street Partner Venue (Sample)",
    address: "King St, Melbourne VIC 3000",
    offer: "50% OFF Door Entry ($10 instead of $20)",
    validHours: "Daily 8:00 PM – 3:00 AM",
    passCode: "HEYBRO-MEL50",
  },
  {
    id: "sydney-1",
    city: "Sydney",
    name: "Kings Cross / CBD Partner Venue (Sample)",
    address: "Darlinghurst Rd, Kings Cross NSW 2011",
    offer: "50% OFF Door Entry Before Midnight",
    validHours: "Thu – Sun 8:00 PM – 2:00 AM",
    passCode: "HEYBRO-SYD50",
  },
];

export default async function VipPassPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-sm text-zinc-500">
          <Link
            href={withLocale(locale, "/")}
            className="hover:text-zinc-200"
          >
            ← Back to directory
          </Link>
        </div>

        <div className="mb-8 text-center">
          <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            FREE DIGITAL DOOR PASS
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            Hey Bro <span className="text-amber-400">VIP Night Pass</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Show this screen to the door host upon arrival to claim instant entry
            discounts. No sign-up required.
          </p>
        </div>

        <div className="space-y-4">
          {PARTNER_CLUBS.map((club) => (
            <div
              key={club.id}
              className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-dashed border-zinc-700 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-400">
                    {club.city}
                  </span>
                  <h2 className="text-lg font-bold text-white">{club.name}</h2>
                  <p className="text-xs text-zinc-400">{club.address}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-extrabold text-emerald-400">
                    ACTIVE PASS
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-base font-extrabold text-amber-400">
                    {club.offer}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Valid: {club.validHours}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-black px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase text-zinc-500">
                    Show Code at Door
                  </span>
                  <span className="font-mono text-sm font-black tracking-widest text-white">
                    {club.passCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-zinc-600">
          Partner venues are sample placeholders until club deals go live. Offers
          are subject to venue door policy · 18+ only.
        </p>
      </div>
    </main>
  );
}
