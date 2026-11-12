import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RosterManager } from "@/components/manage/RosterManager";
import { WhatsAppContactButton } from "@/components/heybro/WhatsAppContactButton";
import { buildAdminSupportWhatsAppHref } from "@/lib/booking-links";
import { fetchCompanionsForVenue } from "@/lib/companions";
import { getSeedDirectoryVenues } from "@/lib/data";
import { getVenueById } from "@/lib/feed";
import { isLocale } from "@/lib/i18n";
import {
  assertVenuePin,
  getVenuePin,
  venuePinCookieName,
} from "@/lib/venue-pins";

export const dynamic = "force-dynamic";

function resolveManageVenue(venueId: string) {
  const seed = getSeedDirectoryVenues().find((item) => item.id === venueId);
  if (seed) return seed;
  const feed = getVenueById(venueId);
  if (feed) return feed;
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; venueId: string }>;
}): Promise<Metadata> {
  const { venueId } = await params;
  const venue = resolveManageVenue(venueId);
  return {
    title: venue
      ? `Manage ${venue.name} roster`
      : "Manage venue roster",
    robots: { index: false, follow: false },
  };
}

export default async function ManageVenueRosterPage({
  params,
}: {
  params: Promise<{ locale: string; venueId: string }>;
}) {
  const { locale, venueId: rawVenueId } = await params;
  if (!isLocale(locale)) notFound();

  const venueId = decodeURIComponent(String(rawVenueId || "").trim());
  const pin = getVenuePin(venueId);
  const venue = resolveManageVenue(venueId);

  // Require a configured PIN + a known venue (seed or feed catalog).
  if (!venue || !pin) notFound();

  const jar = await cookies();
  const savedPin = jar.get(venuePinCookieName(venueId))?.value;
  const unlocked = assertVenuePin(venueId, savedPin);

  const companions = unlocked
    ? await fetchCompanionsForVenue(venueId)
    : [];

  const slotImages = (venue.ladies || []).map(
    (lady) => lady.image || "/images/staff/western/01.jpg",
  );
  const supportHref = buildAdminSupportWhatsAppHref({
    venueName: venue.name,
    venueId,
  });

  return (
    <main className="min-h-[70vh] bg-transparent pb-16 pt-6">
      {supportHref ? (
        <div className="mx-auto mb-2 w-full max-w-3xl px-4">
          <WhatsAppContactButton
            href={supportHref}
            label="Support / Chat with Admin via WhatsApp"
            variant="support"
            venueId={venueId}
            venueName={venue.name}
          />
        </div>
      ) : null}
      <RosterManager
        venueId={venueId}
        venueName={venue.name}
        initiallyUnlocked={unlocked}
        initialCompanions={companions}
        slotImages={
          slotImages.length
            ? slotImages
            : ["/images/staff/western/01.jpg"]
        }
        supportWhatsAppHref={supportHref}
      />
    </main>
  );
}
