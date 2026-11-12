import "server-only";

import {
  formatPricingRateLine,
  parseVenueContent,
  resolveVenuePricing,
  syncContentPricing,
  type ParsedVenueContent,
} from "@/lib/venue-content";
import {
  buildVenueConsumerView,
  type VenueConsumerView,
} from "@/lib/venue-consumer";
import { buildVenueGallery } from "@/lib/venue-gallery";
import {
  parseCustomHighlights,
  resolveVenueVisibility,
  type VenueVisibility,
} from "@/lib/venue-highlights";
import { enrichVisibilityForTemplate } from "@/lib/venue-template";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { getSeedDirectoryVenues } from "@/lib/data";
import { getVenueById } from "@/lib/feed";
import {
  getDirectoryVenues,
  getVenueBySlug,
  mapVenueRow,
  VENUE_SELECT,
} from "@/lib/venues";
import type { Venue } from "@/types";
import type { VenueRow } from "@/types/database";

/** Prefer seed catalog ladies so Supabase rows still get compliant rosters. */
function withSeedLadies(venue: Venue): Venue {
  const clampLadies = <T extends { name?: string; age?: number }>(
    ladies: T[],
  ): T[] =>
    ladies
      .map((lady) => {
        const key = String(lady.name || "").trim().toLowerCase();
        const name =
          key === "chanel"
            ? "Chloe"
            : key === "sophie"
              ? "Bella"
              : lady.name;
        const wasBlocked = key === "chanel" || key === "sophie";
        const displayAge = Math.max(
          wasBlocked ? 22 : 20,
          Number(lady.age) || (wasBlocked ? 22 : 21),
        );
        return { ...lady, name, age: displayAge };
      })
      .filter((lady) => {
        const key = String(lady.name || "").trim().toLowerCase();
        return Number(lady.age) >= 20 && key !== "chanel" && key !== "sophie";
      });

  if (Array.isArray(venue.ladies) && venue.ladies.length > 0) {
    return { ...venue, ladies: clampLadies(venue.ladies) };
  }
  const seed = getSeedDirectoryVenues().find((item) => item.id === venue.id);
  if (!seed?.ladies?.length) return venue;
  return { ...venue, ladies: clampLadies(seed.ladies) };
}

export type VenueStaffRow = {
  id: string;
  name: string | null;
  image_url: string | null;
  sort_order?: number | null;
};

export type VenueDetailPayload = {
  venue: Venue;
  gallery: string[];
  related: Venue[];
  content: ParsedVenueContent;
  visibility: VenueVisibility;
  consumer: VenueConsumerView;
  staffRows: VenueStaffRow[];
};

const RELATED_PRIORITY = [
  "cleopatras-gentlemans-club",
  "my-girls-sydney",
  "cuties-escorts",
];

const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  pymble: { lat: -33.7445, lng: 151.142 },
  "potts point": { lat: -33.868, lng: 151.224 },
  "wetherill park": { lat: -33.849, lng: 150.911 },
  campbelltown: { lat: -34.063, lng: 150.814 },
  sydney: { lat: -33.8688, lng: 151.2093 },
};

async function getStaffRows(venueUuid: string): Promise<VenueStaffRow[]> {
  const client = createSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("venue_staff")
    .select("id, name, image_url, sort_order")
    .eq("venue_id", venueUuid)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as VenueStaffRow[];
}

function withCoords(venue: Venue): Venue {
  if (typeof venue.lat === "number" && typeof venue.lng === "number") return venue;
  const key = venue.suburb.trim().toLowerCase();
  const hit =
    SUBURB_COORDS[key] ||
    Object.entries(SUBURB_COORDS).find(([name]) => key.includes(name))?.[1];
  if (!hit) return venue;
  return { ...venue, lat: hit.lat, lng: hit.lng };
}

function pickRelated(current: Venue, all: Venue[]): Venue[] {
  const others = all.filter((venue) => venue.id !== current.id);
  const prioritized = RELATED_PRIORITY.map((slug) =>
    others.find((venue) => venue.id === slug),
  ).filter((venue): venue is Venue => Boolean(venue));

  const sameCity = others.filter(
    (venue) =>
      venue.city === current.city &&
      !prioritized.some((item) => item.id === venue.id),
  );
  const sameCategory = others.filter(
    (venue) =>
      venue.category === current.category &&
      !prioritized.some((item) => item.id === venue.id) &&
      !sameCity.some((item) => item.id === venue.id),
  );

  return [...prioritized, ...sameCity, ...sameCategory].slice(0, 3);
}

function composeDetail(options: {
  venue: Venue;
  staffRows?: VenueStaffRow[];
  cover?: string | null;
  related: Venue[];
  visibilityExtras?: {
    isManaged?: boolean | null;
    customHighlights?: unknown;
  };
}): VenueDetailPayload {
  const venue = withSeedLadies(withCoords(options.venue));
  const staffRows = options.staffRows ?? [];
  const customHighlights =
    options.visibilityExtras?.customHighlights ?? venue.customHighlights;
  const parsedHighlights = parseCustomHighlights(customHighlights);
  let content = parseVenueContent({
    description: venue.description,
    tags: venue.tags,
    venueId: venue.id,
    category: venue.category,
    city: venue.city,
    suburb: venue.suburb,
    isCbd: venue.isCbd,
  });
  // SQL / admin-seeded operational profiles win over generated ladders.
  const seeded = parsedHighlights.operational;
  if (seeded) {
    content = {
      ...content,
      pricing:
        seeded.pricing && seeded.pricing.length >= 2
          ? seeded.pricing.map((row) => ({
              label: row.label || row.duration || "Session",
              duration: row.duration || "",
              price: row.price || "",
            }))
          : content.pricing,
      payments: seeded.payments?.length ? seeded.payments : content.payments,
      amenities: seeded.amenities?.length
        ? [...new Set([...seeded.amenities, ...content.amenities])].slice(0, 6)
        : content.amenities,
      services: seeded.services?.length
        ? [...new Set([...seeded.services, ...content.services])].slice(0, 8)
        : content.services,
      profile: {
        ...content.profile,
        payments: (seeded.payments as typeof content.profile.payments) ||
          content.profile.payments,
        amenities: (seeded.amenities as typeof content.profile.amenities) ||
          content.profile.amenities,
        services: (seeded.services as typeof content.profile.services) ||
          content.profile.services,
      },
    };
  }
  // Single source of truth: hero rate line always mirrors content.pricing.
  content = syncContentPricing(content);
  const syncedRateLine =
    formatPricingRateLine(resolveVenuePricing(content)) || content.profile.rateLine;
  const visibility = enrichVisibilityForTemplate({
    venueId: venue.id,
    customHighlights: parsedHighlights,
    rateLine: syncedRateLine,
    visibility: resolveVenueVisibility({
      isManaged: options.visibilityExtras?.isManaged ?? venue.isManaged,
      customHighlights,
      content,
    }),
  });
  const consumer = buildVenueConsumerView({
    venue: {
      ...venue,
      isManaged: visibility.isManaged,
      managedBadge: visibility.managedBadge,
    },
    content,
    staffRows,
  });
  // Gallery after roster so thumbs are masked staff + lounge highlights only.
  const gallery = buildVenueGallery({
    cover: options.cover,
    seed: venue.id,
    fallbackCount: 8,
    staffImages: consumer.staff.map((member) => member.image),
  });
  return {
    venue: {
      ...venue,
      isManaged: visibility.isManaged,
      managedBadge: visibility.managedBadge,
      customHighlights: {
        ...parseCustomHighlights(customHighlights),
        hook: visibility.hook,
        tier: visibility.tier,
        managedBadge: visibility.managedBadge,
      },
    },
    gallery,
    related: options.related,
    content,
    visibility,
    consumer,
    staffRows,
  };
}

export async function getVenueDetail(
  slug: string,
): Promise<VenueDetailPayload | null> {
  if (!slug) return null;

  if (isSupabaseConfigured()) {
    const client = createSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("venues")
        .select(VENUE_SELECT)
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        const row = data as VenueRow;
        const venue = mapVenueRow(row);
        const staffRows = await getStaffRows(row.id);
        const { venues } = await getDirectoryVenues();
        return composeDetail({
          venue,
          staffRows,
          cover: row.cover_image_url,
          related: pickRelated(venue, venues),
          visibilityExtras: {
            isManaged: row.is_managed,
            customHighlights: row.custom_highlights,
          },
        });
      }
    }
  }

  const demo = getVenueById(slug);
  if (!demo) return null;
  const { venues } = await getDirectoryVenues();
  const relatedPool = venues.length ? venues : [];
  return composeDetail({
    venue: demo,
    related: pickRelated(
      demo,
      relatedPool.length ? relatedPool : [demo].filter(Boolean),
    ),
  });
}

export async function getRelatedFallback(slug: string): Promise<Venue[]> {
  const venue = (await getVenueBySlug(slug)) ?? getVenueById(slug);
  if (!venue) return [];
  const { venues } = await getDirectoryVenues();
  return pickRelated(venue, venues);
}
