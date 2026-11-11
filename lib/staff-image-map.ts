/**
 * Strict type-safe staff portrait mapping.
 * High-res masquerade-masked / body-pose editorials with styling variety.
 * Unmasked face headshots are intentionally excluded.
 */

export type StaffEthnicityBucket =
  | "asian"
  | "western"
  | "latina"
  | "black";

export type StaffEthnicityLabel =
  | "Chinese"
  | "Japanese"
  | "Asian"
  | "European"
  | "Australian"
  | "Western"
  | "Latina"
  | "Black";

/** Masked East Asian pose editorials — unique looks & attire. */
const ASIAN_PORTRAITS = [
  "/images/staff/asian/01.jpg",
  "/images/staff/asian/02.jpg",
  "/images/staff/asian/03.jpg",
  "/images/staff/asian/04.jpg",
  "/images/staff/asian/05.jpg",
  "/images/staff/asian/06.jpg",
  "/images/staff/asian/07.jpg",
  "/images/staff/asian/08.jpg",
] as const;

/** Masked Western pose editorials — cocktail / evening / lounge wear. */
const WESTERN_PORTRAITS = [
  "/images/staff/western/01.jpg",
  "/images/staff/western/02.jpg",
  "/images/staff/western/03.jpg",
  "/images/staff/western/04.jpg",
  "/images/staff/western/05.jpg",
  "/images/staff/western/06.jpg",
] as const;

const LATINA_PORTRAITS = [
  "/images/staff/latina/01.jpg",
  "/images/staff/latina/02.jpg",
  "/images/staff/latina/03.jpg",
  "/images/staff/latina/04.jpg",
] as const;

const BLACK_PORTRAITS = [
  "/images/staff/black/01.jpg",
  "/images/staff/black/02.jpg",
  "/images/staff/black/03.jpg",
] as const;

export const STAFF_PORTRAIT_POOLS: Record<
  StaffEthnicityBucket,
  readonly string[]
> = {
  asian: ASIAN_PORTRAITS,
  western: WESTERN_PORTRAITS,
  latina: LATINA_PORTRAITS,
  black: BLACK_PORTRAITS,
};

/** Flat female-only masked fallback list. */
export const STAFF_PORTRAIT_FALLBACKS = [
  ...ASIAN_PORTRAITS,
  ...WESTERN_PORTRAITS,
  ...LATINA_PORTRAITS,
  ...BLACK_PORTRAITS,
] as const;

const LABEL_TO_BUCKET: Record<string, StaffEthnicityBucket> = {
  chinese: "asian",
  japanese: "asian",
  korean: "asian",
  asian: "asian",
  "east asian": "asian",
  "south east asian": "asian",
  southeast: "asian",
  华人: "asian",
  日系: "asian",
  european: "western",
  australian: "western",
  western: "western",
  caucasian: "western",
  欧美: "western",
  澳洲本地: "western",
  latina: "latina",
  latin: "latina",
  hispanic: "latina",
  拉美: "latina",
  black: "black",
  african: "black",
  "african american": "black",
};

export function resolveStaffEthnicityBucket(
  ethnicity?: string | null,
): StaffEthnicityBucket {
  const key = (ethnicity || "").trim().toLowerCase();
  if (!key) return "western";
  if (LABEL_TO_BUCKET[key]) return LABEL_TO_BUCKET[key];
  if (/chinese|japan|korea|asian|华人|日|韩|mandarin|cantonese/.test(key)) {
    return "asian";
  }
  if (/latina|latin|hispanic|拉美/.test(key)) return "latina";
  if (/black|african|afro/.test(key)) return "black";
  return "western";
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministic high-res masked portrait from the ethnicity-matched pool.
 * Prefer unused images via `used`; if the ethnicity pool is exhausted, fall
 * through to other curated masked buckets so rosters stay non-repetitive.
 */
export function portraitForEthnicity(
  ethnicity: string | null | undefined,
  seed: string,
  offset = 0,
  used?: Set<string>,
): string {
  const bucket = resolveStaffEthnicityBucket(ethnicity);
  const pool = STAFF_PORTRAIT_POOLS[bucket];
  const start = (hashSeed(seed) + offset) % pool.length;

  if (used) {
    for (let step = 0; step < pool.length; step += 1) {
      const candidate = pool[(start + step) % pool.length];
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }
    // Ethnicity pool exhausted — borrow an unused masked portrait elsewhere.
    for (let step = 0; step < STAFF_PORTRAIT_FALLBACKS.length; step += 1) {
      const candidate =
        STAFF_PORTRAIT_FALLBACKS[
          (start + offset + step * 3) % STAFF_PORTRAIT_FALLBACKS.length
        ];
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }
  }

  const picked = pool[start];
  used?.add(picked);
  return picked;
}

/** Reject anything outside curated masked staff paths. */
export function isTrustedStaffPortrait(url?: string | null): boolean {
  if (!url?.trim()) return false;
  return (
    url.startsWith("/images/staff/asian/") ||
    url.startsWith("/images/staff/western/") ||
    url.startsWith("/images/staff/latina/") ||
    url.startsWith("/images/staff/black/")
  );
}
