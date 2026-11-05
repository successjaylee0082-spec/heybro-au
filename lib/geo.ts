import { listingTierSortRank } from "@/lib/listing-tier";
import type { CityId, Venue } from "@/types";

export type LatLng = { lat: number; lng: number };

/** Official CBD benchmark points for proximity sorting. */
export const CITY_CBD_CENTERS: Record<CityId, LatLng> = {
  sydney: { lat: -33.8688, lng: 151.2093 }, // Sydney Town Hall / George St
  melbourne: { lat: -37.8136, lng: 144.9631 }, // Flinders × Swanston
  brisbane: { lat: -27.4698, lng: 153.0251 },
  perth: { lat: -31.9523, lng: 115.8613 },
  "gold-coast": { lat: -28.0023, lng: 153.4145 },
  adelaide: { lat: -34.9285, lng: 138.6007 },
};

/** Suburbs treated as inside the CBD core for Sydney / Melbourne. */
const CBD_SUBURB_PATTERNS: Partial<Record<CityId, RegExp>> = {
  sydney:
    /^(sydney(\s+cbd)?|cbd|circular quay|haymarket|chinatown|the rocks|barangaroo|wynyard|town hall|world square|darling harbour)$/i,
  melbourne:
    /^(melbourne(\s+cbd)?|cbd|docklands|carlton|east melbourne)$/i,
};

/** Fallback suburb pins when venue lat/lng is missing. */
export const SUBURB_COORDS: Record<string, LatLng> = {
  // Sydney
  cbd: CITY_CBD_CENTERS.sydney,
  "sydney cbd": CITY_CBD_CENTERS.sydney,
  sydney: CITY_CBD_CENTERS.sydney,
  "circular quay": { lat: -33.8612, lng: 151.2108 },
  haymarket: { lat: -33.879, lng: 151.204 },
  "surry hills": { lat: -33.8832, lng: 151.211 },
  "potts point": { lat: -33.868, lng: 151.224 },
  "kings cross": { lat: -33.874, lng: 151.224 },
  darlinghurst: { lat: -33.879, lng: 151.219 },
  "north sydney": { lat: -33.839, lng: 151.207 },
  chatswood: { lat: -33.7969, lng: 151.183 },
  pymble: { lat: -33.7445, lng: 151.142 },
  "wetherill park": { lat: -33.849, lng: 150.911 },
  campbelltown: { lat: -34.063, lng: 150.814 },
  // Melbourne
  "melbourne cbd": CITY_CBD_CENTERS.melbourne,
  melbourne: CITY_CBD_CENTERS.melbourne,
  southbank: { lat: -37.823, lng: 144.964 },
  "st kilda": { lat: -37.868, lng: 144.98 },
  richmond: { lat: -37.823, lng: 144.998 },
  // Other cities
  "fortitude valley": { lat: -27.457, lng: 153.034 },
  northbridge: { lat: -31.948, lng: 115.858 },
  "surfers paradise": { lat: -28.002, lng: 153.429 },
  "adelaide cbd": CITY_CBD_CENTERS.adelaide,
};

/** Venues within this radius of CBD center count as CBD even without suburb match. */
export const CBD_RADIUS_KM = 1.15;

export type VenueSortMode = "cbd-distance" | "name" | "managed";

export const DEFAULT_VENUE_SORT: VenueSortMode = "cbd-distance";

export const VENUE_SORT_OPTIONS: Array<{
  id: VenueSortMode;
  label: string;
  labelZh: string;
}> = [
  {
    id: "cbd-distance",
    label: "Distance from City (CBD First)",
    labelZh: "距市中心（CBD优先）",
  },
  { id: "managed", label: "VIP / Managed first", labelZh: "VIP / 托管优先" },
  { id: "name", label: "Name A–Z", labelZh: "名称 A–Z" },
];

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function resolveVenueCoords(venue: Pick<Venue, "lat" | "lng" | "suburb" | "city">): LatLng | null {
  if (
    typeof venue.lat === "number" &&
    typeof venue.lng === "number" &&
    Number.isFinite(venue.lat) &&
    Number.isFinite(venue.lng)
  ) {
    return { lat: venue.lat, lng: venue.lng };
  }
  const key = venue.suburb.trim().toLowerCase();
  if (SUBURB_COORDS[key]) return SUBURB_COORDS[key];
  const partial = Object.entries(SUBURB_COORDS).find(([name]) =>
    key.includes(name),
  );
  if (partial) return partial[1];
  return CITY_CBD_CENTERS[venue.city] || null;
}

export function isCbdVenue(venue: Pick<Venue, "city" | "suburb" | "lat" | "lng" | "isCbd">): boolean {
  if (venue.isCbd === true) return true;
  const suburb = venue.suburb.trim();
  const pattern = CBD_SUBURB_PATTERNS[venue.city];
  if (pattern?.test(suburb)) return true;
  if (/cbd/i.test(suburb)) return true;
  const coords = resolveVenueCoords(venue);
  const center = CITY_CBD_CENTERS[venue.city];
  if (!coords || !center) return false;
  return haversineKm(coords, center) <= CBD_RADIUS_KM;
}

export function formatDistanceBadge(options: {
  suburb: string;
  isCbd: boolean;
  distanceKm: number | null;
  fromLabel?: string;
}): string {
  const from = options.fromLabel || "CBD";
  if (options.isCbd) {
    if (options.distanceKm == null || options.distanceKm < 0.05) {
      return `CBD • 0m`;
    }
    if (options.distanceKm < 1) {
      return `CBD • ${Math.round(options.distanceKm * 1000)}m`;
    }
    return `CBD • ${options.distanceKm.toFixed(1)}km`;
  }
  if (options.distanceKm == null || !Number.isFinite(options.distanceKm)) {
    return `${options.suburb} • near ${from}`;
  }
  if (options.distanceKm < 1) {
    return `${options.suburb} • ${Math.round(options.distanceKm * 1000)}m from ${from}`;
  }
  return `${options.suburb} • ${options.distanceKm.toFixed(1)}km from ${from}`;
}

export type RankedVenue = Venue & {
  isCbd: boolean;
  distanceFromCbdKm: number | null;
  distanceFromOriginKm: number | null;
  distanceBadge: string;
  sortScore: number;
};

export function enrichVenueDistance(
  venue: Venue,
  origin?: LatLng | null,
): RankedVenue {
  const cbd = CITY_CBD_CENTERS[venue.city];
  const coords = resolveVenueCoords(venue);
  const isCbd = isCbdVenue(venue);
  const distanceFromCbdKm =
    coords && cbd ? haversineKm(coords, cbd) : null;
  const reference = origin || cbd;
  const distanceFromOriginKm =
    coords && reference ? haversineKm(coords, reference) : distanceFromCbdKm;
  const distanceBadge = formatDistanceBadge({
    suburb: venue.suburb,
    isCbd,
    distanceKm: origin ? distanceFromOriginKm : distanceFromCbdKm,
    fromLabel: origin ? "you" : "CBD",
  });
  // Lower score sorts first: CBD cluster, then proximity.
  const proximity = distanceFromOriginKm ?? 9999;
  const sortScore = (isCbd ? 0 : 1000) + proximity;

  return {
    ...venue,
    lat: coords?.lat ?? venue.lat,
    lng: coords?.lng ?? venue.lng,
    isCbd,
    distanceFromCbdKm,
    distanceFromOriginKm,
    distanceBadge,
    sortScore,
  };
}

export function sortVenuesByMode(
  venues: Venue[],
  mode: VenueSortMode = DEFAULT_VENUE_SORT,
  origin?: LatLng | null,
): RankedVenue[] {
  const ranked = venues.map((venue) => enrichVenueDistance(venue, origin));
  // Commercial rule: Business VIP / managed listings always pin above Free.
  const byTierThen = (
    a: RankedVenue,
    b: RankedVenue,
    next: (x: RankedVenue, y: RankedVenue) => number,
  ) => {
    const tierDelta = listingTierSortRank(a) - listingTierSortRank(b);
    if (tierDelta !== 0) return tierDelta;
    return next(a, b);
  };

  if (mode === "name") {
    return ranked.sort((a, b) =>
      byTierThen(a, b, (x, y) => x.name.localeCompare(y.name)),
    );
  }
  if (mode === "managed") {
    return ranked.sort((a, b) =>
      byTierThen(a, b, (x, y) => x.sortScore - y.sortScore),
    );
  }
  // Default: VIP first, then CBD cluster, then proximity.
  return ranked.sort((a, b) =>
    byTierThen(a, b, (x, y) => {
      if (x.isCbd !== y.isCbd) return x.isCbd ? -1 : 1;
      const da = x.distanceFromOriginKm ?? Number.POSITIVE_INFINITY;
      const db = y.distanceFromOriginKm ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return x.name.localeCompare(y.name);
    }),
  );
}
