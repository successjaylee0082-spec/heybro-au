import "server-only";

import { enrichVenueDistance } from "@/lib/geo";
import { attachPricingToVenues, getSeedDirectoryVenues } from "@/lib/data";
import {
  assignDirectoryPoseCovers,
  directoryPoseFor,
} from "@/lib/directory-covers";
import { feedVenues } from "@/lib/feed";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { parseCustomHighlights } from "@/lib/venue-highlights";
import type { CategoryId, CityId, Venue } from "@/types";
import type { VenueRow } from "@/types/database";

const CITY_IDS = new Set<CityId>([
  "sydney",
  "melbourne",
  "brisbane",
  "perth",
  "gold-coast",
  "adelaide",
]);

const CATEGORY_IDS = new Set<CategoryId>([
  "brothels",
  "escorts-massage",
  "strip-clubs",
  "adult-retail",
  "nightlife-events",
]);

export const VENUE_SELECT =
  "id, slug, name, category, city, suburb, address, state, postcode, phone, website, hours, services, description, cover_image_url, lat, lng, source_url, source_name, source_id, is_fictional, is_managed, custom_highlights, created_at, updated_at";
// listing_tier is applied via migration 20261106; prefer custom_highlights.tier until the column is live.

export type DirectoryLoadResult = {
  venues: Venue[];
  source: "supabase" | "seed" | "unavailable";
  error?: string;
};

function seedDirectoryFallback(error?: string): DirectoryLoadResult {
  const seeded = assignDirectoryPoseCovers(
    attachPricingToVenues([
      ...getSeedDirectoryVenues(),
      ...feedVenues.filter((venue) => venue.city !== "melbourne"),
    ]),
  );
  return {
    venues: seeded,
    source: "seed",
    error,
  };
}

function normalizeCity(value: string | null | undefined): CityId {
  const city = (value || "sydney").trim().toLowerCase().replace(/\s+/g, "-");
  if (CITY_IDS.has(city as CityId)) return city as CityId;
  return "sydney";
}

function normalizeCategory(value: string | null | undefined): CategoryId {
  const category = (value || "brothels").trim().toLowerCase();
  if (CATEGORY_IDS.has(category as CategoryId)) return category as CategoryId;
  if (category.includes("escort") || category.includes("massage")) {
    return "escorts-massage";
  }
  if (category.includes("strip")) return "strip-clubs";
  if (category.includes("retail")) return "adult-retail";
  if (category.includes("nightlife") || category.includes("event")) {
    return "nightlife-events";
  }
  return "brothels";
}

export function mapVenueRow(row: VenueRow): Venue {
  const services = Array.isArray(row.services)
    ? row.services.filter((item): item is string => typeof item === "string")
    : [];
  const highlights = parseCustomHighlights(row.custom_highlights);
  const listingTier =
    row.listing_tier === "vip" ||
    row.listing_tier === "managed" ||
    row.listing_tier === "free"
      ? row.listing_tier
      : highlights.tier || undefined;
  const isManaged =
    Boolean(row.is_managed) ||
    listingTier === "managed" ||
    listingTier === "vip";
  const base: Venue = {
    id: row.slug || row.id,
    name: row.name,
    city: normalizeCity(row.city),
    suburb: row.suburb?.trim() || "Sydney",
    category: normalizeCategory(row.category),
    description:
      row.description?.trim() || `${row.name} in ${row.suburb || row.city}.`,
    // Directory cards use masked alluring female poses (all different when listed).
    image: directoryPoseFor(row.slug || row.id || row.name),
    tags: services.slice(0, 6),
    phone: row.phone || undefined,
    address:
      row.address?.trim() ||
      [row.suburb, row.state, row.postcode].filter(Boolean).join(" ") ||
      row.city,
    lat: typeof row.lat === "number" && Number.isFinite(row.lat) ? row.lat : undefined,
    lng: typeof row.lng === "number" && Number.isFinite(row.lng) ? row.lng : undefined,
    verified: !row.is_fictional,
    fictional: Boolean(row.is_fictional),
    hours: row.hours || undefined,
    website: row.website || undefined,
    isManaged,
    managedBadge: isManaged
      ? highlights.managedBadge || (listingTier === "vip" ? "vip" : "pro")
      : undefined,
    customHighlights: {
      badges: highlights.badges,
      promo: highlights.promo,
      hook: highlights.hook,
      managedBadge: highlights.managedBadge,
      tier: listingTier || highlights.tier || (isManaged ? "managed" : "free"),
      wechat: highlights.wechat,
      whatsapp: highlights.whatsapp,
      telegram: highlights.telegram,
    },
  };
  const ranked = enrichVenueDistance(base);
  return {
    ...ranked,
    isCbd: ranked.isCbd,
    distanceFromCbdKm: ranked.distanceFromCbdKm,
    distanceBadge: ranked.distanceBadge,
  };
}

export async function getDirectoryVenues(): Promise<DirectoryLoadResult> {
  if (!isSupabaseConfigured()) {
    return seedDirectoryFallback("Supabase is not configured — using Melbourne seed listings");
  }

  const client = createSupabaseClient();
  if (!client) {
    return seedDirectoryFallback(
      "Supabase client could not be created — using Melbourne seed listings",
    );
  }

  // Pull coords for CBD-first / proximity ranking on the client.
  // Prefer managed + name as a stable SQL pre-order; final CBD sort is in filterVenues.
  const { data, error } = await client
    .from("venues")
    .select(VENUE_SELECT)
    .order("is_managed", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return seedDirectoryFallback(error.message);
  }

  try {
    const venues = assignDirectoryPoseCovers(
      attachPricingToVenues(
        (data as VenueRow[] | null)?.map(mapVenueRow) ?? [],
      ),
    );
    // If live DB has no Melbourne rows, merge seed so city filter is never empty.
    const hasMelbourne = venues.some((venue) => venue.city === "melbourne");
    if (!hasMelbourne || venues.length === 0) {
      const seed = getSeedDirectoryVenues();
      const merged = assignDirectoryPoseCovers(
        attachPricingToVenues([
          ...seed,
          ...venues.filter((venue) => venue.city !== "melbourne"),
          ...feedVenues.filter(
            (venue) =>
              venue.city !== "melbourne" &&
              !venues.some((live) => live.id === venue.id),
          ),
        ]),
      );
      return { venues: merged, source: venues.length ? "supabase" : "seed" };
    }
    return { venues, source: "supabase" };
  } catch (err) {
    return seedDirectoryFallback(
      err instanceof Error
        ? err.message
        : "Failed to map venue rows for directory",
    );
  }
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  if (!slug || !isSupabaseConfigured()) return null;

  const client = createSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("venues")
    .select(VENUE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapVenueRow(data as VenueRow);
}
