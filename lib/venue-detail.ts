import "server-only";

import { parseVenueContent, type ParsedVenueContent } from "@/lib/venue-content";
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
import { getVenueById } from "@/lib/feed";
import {
  getDirectoryVenues,
  getVenueBySlug,
  mapVenueRow,
  VENUE_SELECT,
} from "@/lib/venues";
import type { Venue } from "@/types";
import type { VenueRow } from "@/types/database";

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
  const venue = withCoords(options.venue);
  const staffRows = options.staffRows ?? [];
  const gallery = buildVenueGallery({
    // Prefer nightlife lounge cover; never inject unverified staff portraits.
    cover: options.cover || venue.image,
    seed: venue.id,
    fallbackCount: 8,
  });
  const content = parseVenueContent({
    description: venue.description,
    tags: venue.tags,
  });
  const customHighlights =
    options.visibilityExtras?.customHighlights ?? venue.customHighlights;
  const visibility = enrichVisibilityForTemplate({
    venueId: venue.id,
    customHighlights: parseCustomHighlights(customHighlights),
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
    gallery,
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
