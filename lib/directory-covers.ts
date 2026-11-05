/**
 * Directory card covers — masked alluring female poses only.
 * Lounge/cafe interiors are intentionally excluded from listing cards.
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

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Stable per-venue pose pick (may repeat only after the full pool cycles). */
export function directoryPoseFor(seed: string, offset = 0): string {
  const index = (hashSeed(seed) + offset) % DIRECTORY_POSE_COVERS.length;
  return DIRECTORY_POSE_COVERS[index];
}

/**
 * Assign unique-as-possible poses across a venue list.
 * Guarantees no two consecutive cards share the same image.
 */
export function assignDirectoryPoseCovers<T extends { id: string; image: string }>(
  venues: T[],
): T[] {
  if (!venues.length) return venues;
  const pool = DIRECTORY_POSE_COVERS;
  const used = new Set<string>();
  let previous: string | null = null;

  return venues.map((venue, index) => {
    const start = (hashSeed(venue.id) + index * 3) % pool.length;
    let picked: string | null = null;

    // Prefer unused, then unused-relative-to-neighbor.
    for (let step = 0; step < pool.length; step += 1) {
      const candidate = pool[(start + step) % pool.length];
      if (used.has(candidate)) continue;
      if (candidate === previous) continue;
      picked = candidate;
      break;
    }

    // Pool exhausted — still avoid consecutive duplicates.
    if (!picked) {
      for (let step = 0; step < pool.length; step += 1) {
        const candidate = pool[(start + step) % pool.length];
        if (candidate !== previous) {
          picked = candidate;
          break;
        }
      }
    }

    picked = picked || pool[start];
    used.add(picked);
    previous = picked;
    return { ...venue, image: picked };
  });
}
