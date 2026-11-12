import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManageVenuePicker } from "@/components/manage/ManageVenuePicker";
import { getSeedDirectoryVenues } from "@/lib/data";
import { getVenueById } from "@/lib/feed";
import { isLocale } from "@/lib/i18n";
import { listManageableVenueIds } from "@/lib/venue-pins";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage venues",
  robots: { index: false, follow: false },
};

export default async function ManageIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const seeds = getSeedDirectoryVenues();
  const venues = listManageableVenueIds().map((id) => {
    const seed = seeds.find((item) => item.id === id);
    const feed = seed || getVenueById(id);
    return {
      id,
      name: feed?.name || id,
      city: feed?.city || null,
      suburb: feed?.suburb || null,
    };
  });

  return (
    <main className="min-h-[70vh] bg-transparent pb-16 pt-6">
      <ManageVenuePicker locale={locale} venues={venues} />
    </main>
  );
}
