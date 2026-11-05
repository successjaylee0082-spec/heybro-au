import "server-only";

import {
  luxuryCoverFor,
  luxuryPortraitFor,
} from "@/lib/luxury-assets";
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

export type DirectoryLoadResult = {
  venues: Venue[];
  source: "supabase" | "unavailable";
  error?: string;
};

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
  const isManaged = Boolean(row.is_managed);
  return {
    id: row.slug || row.id,
    name: row.name,
    city: normalizeCity(row.city),
    suburb: row.suburb?.trim() || "Sydney",
    category: normalizeCategory(row.category),
    description:
      row.description?.trim() || `${row.name} in ${row.suburb || row.city}.`,
    // Directory cards use curated luxury portraits/lounges for a premium OP look.
    // Original scraped covers still feed the detail gallery via cover_image_url.
    image: (() => {
      const seed = row.slug || row.id || row.name;
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      }
      return hash % 3 === 0
        ? luxuryCoverFor(seed)
        : luxuryPortraitFor(seed);
    })(),
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
    managedBadge: isManaged ? highlights.managedBadge || "pro" : undefined,
    customHighlights: {
      badges: highlights.badges,
      promo: highlights.promo,
      hook: highlights.hook,
      managedBadge: highlights.managedBadge,
      tier: highlights.tier,
    },
  };
}

export async function getDirectoryVenues(): Promise<DirectoryLoadResult> {
  if (!isSupabaseConfigured()) {
    return {
      venues: [],
      source: "unavailable",
      error: "Supabase is not configured",
    };
  }

  const client = createSupabaseClient();
  if (!client) {
    return {
      venues: [],
      source: "unavailable",
      error: "Supabase client could not be created",
    };
  }

  const { data, error } = await client
    .from("venues")
    .select(VENUE_SELECT)
    .order("is_managed", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return {
      venues: [],
      source: "unavailable",
      error: error.message,
    };
  }

  const venues = (data as VenueRow[] | null)?.map(mapVenueRow) ?? [];
  return { venues, source: "supabase" };
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
