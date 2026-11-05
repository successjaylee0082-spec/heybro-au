import { HighlightsAdminClient } from "@/components/admin/HighlightsAdminClient";
import {
  getAdminPanelKey,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import { isLocale } from "@/lib/i18n";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { parseCustomHighlights } from "@/lib/venue-highlights";
import { VENUE_SELECT, mapVenueRow } from "@/lib/venues";
import type { VenueRow } from "@/types/database";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HighlightsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const authenticated = await isAdminAuthenticated();
  const adminConfigured = Boolean(getAdminPanelKey());
  let venues: Array<{
    id: string;
    name: string;
    suburb: string;
    isManaged?: boolean;
    managedBadge?: "pro" | "vip";
    rawHighlights: ReturnType<typeof parseCustomHighlights>;
  }> = [];

  if (authenticated && isSupabaseConfigured()) {
    const client = createSupabaseClient();
    if (client) {
      const { data } = await client
        .from("venues")
        .select(VENUE_SELECT)
        .order("is_managed", { ascending: false })
        .order("name", { ascending: true })
        .limit(100);
      venues = ((data as VenueRow[] | null) ?? []).map((row) => {
        const venue = mapVenueRow(row);
        return {
          id: venue.id,
          name: venue.name,
          suburb: venue.suburb,
          isManaged: venue.isManaged,
          managedBadge: venue.managedBadge,
          rawHighlights: parseCustomHighlights(row.custom_highlights),
        };
      });
    }
  }

  return (
    <HighlightsAdminClient
      initialVenues={venues}
      authenticated={authenticated}
      adminConfigured={adminConfigured}
    />
  );
}
