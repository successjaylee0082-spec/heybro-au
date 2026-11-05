/**
 * Directory card covers — masked alluring female poses only.
 * Lounge/cafe/bar interiors are banned from listing cards.
 */

export const DIRECTORY_POSE_COVERS = [
  "/images/directory/01.jpg",
  "/images/directory/02.jpg",
  "/images/directory/03.jpg",
  "/images/directory/04.jpg",
  "/images/directory/05.jpg",
  "/images/directory/06.jpg",
  "/images/directory/07.jpg",
  "/images/directory/08.jpg",
  "/images/directory/09.jpg",
  "/images/directory/10.jpg",
  "/images/directory/11.jpg",
  "/images/directory/12.jpg",
  "/images/directory/13.jpg",
  "/images/directory/14.jpg",
  "/images/directory/15.jpg",
  "/images/directory/16.jpg",
  "/images/directory/17.jpg",
  "/images/directory/18.jpg",
  "/images/directory/19.jpg",
  "/images/directory/20.jpg",
  "/images/directory/21.jpg",
  "/images/directory/22.jpg",
  "/images/directory/23.jpg",
  "/images/directory/24.jpg",
  "/images/directory/25.jpg",
  "/images/directory/26.jpg",
  "/images/directory/27.jpg",
  "/images/directory/28.jpg",
  "/images/directory/29.jpg",
  "/images/directory/30.jpg",
  "/images/directory/31.jpg",
  "/images/directory/32.jpg",
  "/images/directory/33.jpg",
  "/images/directory/34.jpg",
  "/images/directory/35.jpg",
  "/images/directory/36.jpg",
] as const;

const INTERIOR_BAN =
  /\/images\/lounges\/|lounge|cocktail-bar|cafe|restaurant|dining|bar-interior|velvet-hi|mood-\d|hires-\d|unsplash\.com\/photo-|apartment|living-room/i;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function isDirectoryPoseCover(url?: string | null): boolean {
  if (!url) return false;
  return DIRECTORY_POSE_COVERS.includes(
    url as (typeof DIRECTORY_POSE_COVERS)[number],
  );
}

/** True for bar/lounge/cafe/stock interiors that must never appear on roster cards. */
export function isBannedCardInterior(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (isDirectoryPoseCover(url)) return false;
  if (url.startsWith("/images/directory/")) return false;
  if (url.startsWith("/images/staff/")) return false;
  return INTERIOR_BAN.test(url) || !url.startsWith("/images/directory/");
}

/** Stable per-venue pose pick (may repeat only after the full pool cycles). */
export function directoryPoseFor(seed: string, offset = 0): string {
  const index = (hashSeed(seed) + offset) % DIRECTORY_POSE_COVERS.length;
  return DIRECTORY_POSE_COVERS[index];
}

/**
 * Force a card-safe pose cover. Replaces lounge/cafe/remote interiors.
 */
export function resolveCardPoseCover(
  seed: string,
  current?: string | null,
  offset = 0,
): string {
  if (current && isDirectoryPoseCover(current)) return current;
  if (current && !isBannedCardInterior(current) && current.startsWith("/images/directory/")) {
    return current;
  }
  return directoryPoseFor(seed, offset);
}

/**
 * Assign unique-as-possible poses across a venue list.
 * Guarantees no two consecutive cards share the same image, and skips the
 * previous pool neighbor when possible (reduces near-duplicate styling).
 */
export function assignDirectoryPoseCovers<T extends { id: string; image: string }>(
  venues: T[],
): T[] {
  if (!venues.length) return venues;
  const pool = DIRECTORY_POSE_COVERS;
  const used = new Set<string>();
  let previous: string | null = null;
  let previousIndex = -1;

  return venues.map((venue, index) => {
    const start = (hashSeed(venue.id) + index * 3) % pool.length;
    let picked: string | null = null;

    const isNearDuplicate = (candidate: string, candidateIndex: number) => {
      if (candidate === previous) return true;
      if (previousIndex < 0) return false;
      const span = pool.length;
      const dist = Math.min(
        Math.abs(candidateIndex - previousIndex),
        span - Math.abs(candidateIndex - previousIndex),
      );
      // Skip immediate neighbors in the curated sequence when unused options remain.
      return dist <= 1;
    };

    // Prefer unused, then not near the previous card's pose.
    for (let step = 0; step < pool.length; step += 1) {
      const candidateIndex = (start + step) % pool.length;
      const candidate = pool[candidateIndex];
      if (used.has(candidate)) continue;
      if (isNearDuplicate(candidate, candidateIndex)) continue;
      picked = candidate;
      previousIndex = candidateIndex;
      break;
    }

    if (!picked) {
      for (let step = 0; step < pool.length; step += 1) {
        const candidateIndex = (start + step) % pool.length;
        const candidate = pool[candidateIndex];
        if (used.has(candidate)) continue;
        if (candidate === previous) continue;
        picked = candidate;
        previousIndex = candidateIndex;
        break;
      }
    }

    // Pool exhausted — still avoid consecutive identical images.
    if (!picked) {
      for (let step = 0; step < pool.length; step += 1) {
        const candidateIndex = (start + step) % pool.length;
        const candidate = pool[candidateIndex];
        if (candidate !== previous) {
          picked = candidate;
          previousIndex = candidateIndex;
          break;
        }
      }
    }

    picked = picked || pool[start];
    if (previousIndex < 0) previousIndex = pool.indexOf(picked as (typeof pool)[number]);
    used.add(picked);
    previous = picked;
    return { ...venue, image: picked };
  });
}
