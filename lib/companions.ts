import {
  sanitizeCompanionName,
  isBlockedCompanionName,
} from "@/lib/companion-profile";
import { getSeedDirectoryVenues } from "@/lib/data";
import { createPublicSupabaseClient } from "@/lib/supabase";
import type { VenueLady } from "@/types";

export type CompanionRow = {
  id?: string;
  venue_id?: string;
  slot_index?: number | null;
  name?: string | null;
  age?: number | string | null;
  height?: number | string | null;
  cup?: string | null;
  nationality?: string | null;
  tags?: string[] | null;
  is_active?: boolean | null;
};

function scrubCompanionName(name: unknown): string {
  const key = String(name || "")
    .trim()
    .toLowerCase();
  if (key === "chanel") return "Chloe";
  if (key === "sophie") return "Bella";
  return sanitizeCompanionName(name);
}

/** Strict 20+ floor for live companion rows. */
export function companionAgeFloor(value: unknown): number {
  return Math.max(20, Number(value) || 20);
}

function resolveSlotImage(
  seedLadies: VenueLady[],
  slotIndex: number,
  fallbackIndex: number,
): VenueLady | undefined {
  if (
    Number.isFinite(slotIndex) &&
    slotIndex >= 0 &&
    slotIndex < seedLadies.length
  ) {
    return seedLadies[slotIndex];
  }
  // Support 1-based slot_index from dashboards.
  if (
    Number.isFinite(slotIndex) &&
    slotIndex >= 1 &&
    slotIndex <= seedLadies.length
  ) {
    return seedLadies[slotIndex - 1];
  }
  return seedLadies[fallbackIndex] || seedLadies[0];
}

function mapStatus(isActive: boolean | null | undefined): VenueLady["status"] {
  if (isActive === false) return "Off Shift";
  return "Available Now";
}

/**
 * Map Supabase companion rows onto the local seed image pool by slot_index.
 * Existing image URLs are preserved — DB never supplies portrait paths.
 */
export function mapCompanionRowsToLadies(
  rows: CompanionRow[],
  seedLadies: VenueLady[],
  venueId: string,
): VenueLady[] {
  if (!rows.length) return [];

  return rows
    .map((row, index) => {
      const slot = Number(row.slot_index);
      const seed = resolveSlotImage(
        seedLadies,
        Number.isFinite(slot) ? slot : index,
        index,
      );
      const rawName = String(row.name || "").trim();
      const rawKey = rawName.toLowerCase();
      const name = scrubCompanionName(rawName);
      if (isBlockedCompanionName(name)) return null;

      const age = companionAgeFloor(
        rawKey === "chanel" ? 22 : rawKey === "sophie" ? 23 : row.age,
      );

      const tags = Array.isArray(row.tags)
        ? row.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
        : [];

      const lady: VenueLady = {
        id: String(row.id || `${venueId}-slot-${Number.isFinite(slot) ? slot : index}`),
        name,
        age,
        heightCm:
          Number(row.height) ||
          seed?.heightCm ||
          165,
        cup: String(row.cup || seed?.cup || "C").toUpperCase(),
        ethnicity: String(row.nationality || seed?.ethnicity || "European"),
        styles: tags.length ? tags.slice(0, 3) : seed?.styles || ["GFE", "Elegant"],
        status: mapStatus(row.is_active),
        // Keep the curated local portrait for this slot — never break images.
        image: seed?.image || "/images/staff/western/01.jpg",
      };
      return lady;
    })
    .filter((lady): lady is VenueLady => Boolean(lady));
}

/**
 * Fetch live companions for a venue slug / id.
 * Ordered by slot_index ascending. Uses anon key + cache: no-store.
 */
export async function fetchCompanionsForVenue(
  venueId: string,
): Promise<CompanionRow[]> {
  if (!venueId) return [];
  const client = createPublicSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from("companions")
    .select("*")
    .eq("venue_id", venueId)
    .order("slot_index", { ascending: true });

  if (error || !data) return [];
  return data as CompanionRow[];
}

/**
 * Resolve ladies for a venue page: companions table first, seed fallback.
 * Images always come from the seed slot pool.
 */
export async function resolveVenueLadies(options: {
  venueId: string;
  /** Extra venue_id keys to try (e.g. Supabase UUID + public slug). */
  venueIdAliases?: string[];
  seedLadies?: VenueLady[];
}): Promise<{ ladies: VenueLady[]; source: "companions" | "seed" }> {
  const seed =
    options.seedLadies ||
    getSeedDirectoryVenues().find((item) => item.id === options.venueId)
      ?.ladies ||
    [];

  const ids = Array.from(
    new Set(
      [options.venueId, ...(options.venueIdAliases || [])].filter(Boolean),
    ),
  );

  for (const id of ids) {
    const rows = await fetchCompanionsForVenue(id);
    if (rows.length > 0) {
      const ladies = mapCompanionRowsToLadies(rows, seed, options.venueId);
      if (ladies.length > 0) {
        return { ladies, source: "companions" };
      }
    }
  }

  return {
    ladies: (seed || []).map((lady) => ({
      ...lady,
      name: scrubCompanionName(lady.name),
      age: companionAgeFloor(lady.age),
    })),
    source: "seed",
  };
}
