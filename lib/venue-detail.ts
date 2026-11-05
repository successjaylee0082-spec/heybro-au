import "server-only";

import { parseVenueContent, type ParsedVenueContent } from "@/lib/venue-content";
import { buildVenueGallery } from "@/lib/venue-gallery";
import {
  resolveVenueVisibility,
  type VenueVisibility,
} from "@/lib/venue-highlights";
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

export type VenueDetailPayload = {
  venue: Venue;
  gallery: string[];
  related: Venue[];
  content: ParsedVenueContent;
  visibility: VenueVisibility;
};

const RELATED_PRIORITY = [
  "cleopatras-gentlemans-club",
  "my-girls-sydney",
  "cuties-escorts",
];

async function getStaffImages(venueUuid: string): Promise<string[]> {
  const client = createSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from("venue_staff")
    .select("image_url, sort_order")
    .eq("venue_id", venueUuid)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data
    .map((row) => row.image_url as string | null)
    .filter((url): url is string => Boolean(url?.trim()));
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
        const staffImages = await getStaffImages(row.id);
        const gallery = buildVenueGallery({
          cover: row.cover_image_url || venue.image,
          staffImages,
        });
        const { venues } = await getDirectoryVenues();
        const related = pickRelated(venue, venues);
        const content = parseVenueContent({
          description: venue.description,
          tags: venue.tags,
        });
        const visibility = resolveVenueVisibility({
          isManaged: row.is_managed,
          customHighlights: row.custom_highlights,
          content,
        });
        return { venue, gallery, related, content, visibility };
      }
    }
  }

  const demo = getVenueById(slug);
  if (!demo) return null;
  const { venues } = await getDirectoryVenues();
  const relatedPool = venues.length ? venues : [];
  const content = parseVenueContent({
    description: demo.description,
    tags: demo.tags,
  });
  return {
    venue: demo,
    gallery: buildVenueGallery({ cover: demo.image }),
    related: pickRelated(demo, relatedPool.length ? relatedPool : [demo].filter(Boolean)),
    content,
    visibility: resolveVenueVisibility({
      isManaged: demo.isManaged,
      customHighlights: demo.customHighlights,
      content,
    }),
  };
}

export async function getRelatedFallback(slug: string): Promise<Venue[]> {
  const venue = (await getVenueBySlug(slug)) ?? getVenueById(slug);
  if (!venue) return [];
  const { venues } = await getDirectoryVenues();
  return pickRelated(venue, venues);
}
