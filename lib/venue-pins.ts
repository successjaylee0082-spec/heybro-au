/**
 * Venue owner PIN helpers.
 *
 * Auth order:
 * 1. Master admin PIN "8899" unlocks any venue (platform ops).
 * 2. Supabase `venues.manager_pin` for the venue slug (preferred).
 * 3. Env overrides (`VENUE_OWNER_PINS` / `VENUE_PIN_*`).
 * 4. Seed fallback map when Supabase is unavailable.
 */

import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase";
import { SEED_VENUE_MANAGER_PINS } from "@/lib/venue-manager-pins.seed";

/** Platform master admin PIN — unlocks every manage desk. */
export const MASTER_ADMIN_PIN = "8899";

export const VENUE_PIN_COOKIE_PREFIX = "heybro-venue-pin";

function envPinOverrides(): Record<string, string> {
  const out: Record<string, string> = {};
  const json = process.env.VENUE_OWNER_PINS?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as Record<string, string>;
      for (const [key, value] of Object.entries(parsed)) {
        if (/^\d{4}$/.test(String(value)) && String(value) !== MASTER_ADMIN_PIN) {
          out[key] = String(value);
        }
      }
    } catch {
      // ignore malformed JSON
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    const match = /^VENUE_PIN_(.+)$/.exec(key);
    if (!match || !value) continue;
    const venueId = match[1].toLowerCase().replace(/_/g, "-");
    const pin = value.trim();
    if (/^\d{4}$/.test(pin) && pin !== MASTER_ADMIN_PIN) out[venueId] = pin;
  }
  return out;
}

function localPinMap(): Record<string, string> {
  return { ...SEED_VENUE_MANAGER_PINS, ...envPinOverrides() };
}

/** Sync seed/env pin lookup (no Supabase). Prefer getVenueManagerPin(). */
export function getVenuePin(venueId: string): string | null {
  const id = String(venueId || "").trim();
  if (!id) return null;
  return localPinMap()[id] || null;
}

/** Venue ids available on the manage picker (seed + env). */
export function listManageableVenueIds(): string[] {
  return Object.keys(localPinMap()).sort((a, b) => a.localeCompare(b));
}

export function isMasterAdminPin(
  candidate: string | null | undefined,
): boolean {
  return String(candidate || "").trim() === MASTER_ADMIN_PIN;
}

/**
 * Resolve the owner PIN for a venue slug from Supabase, else seed/env.
 * Returns null when no per-venue PIN is configured (master admin still works).
 */
export async function getVenueManagerPin(
  venueId: string,
): Promise<string | null> {
  const id = String(venueId || "").trim();
  if (!id) return null;

  const client = createAdminSupabaseClient();
  if (client) {
    const { data, error } = await client
      .from("venues")
      .select("manager_pin, slug")
      .eq("slug", id)
      .maybeSingle();

    if (!error && data) {
      const pin = String(
        (data as { manager_pin?: string | null }).manager_pin || "",
      ).trim();
      if (/^\d{4}$/.test(pin) && pin !== MASTER_ADMIN_PIN) return pin;
    }
  }

  return getVenuePin(id);
}

/**
 * True when this venue can be opened in /manage (has a pin or is seed-known).
 * Master admin can unlock even when the per-venue pin is missing.
 */
export async function isManageableVenue(venueId: string): Promise<boolean> {
  const id = String(venueId || "").trim();
  if (!id) return false;
  if (getVenuePin(id)) return true;
  const fromDb = await getVenueManagerPin(id);
  return Boolean(fromDb);
}

/** Validate a candidate PIN for a specific venue (async, Supabase-aware). */
export async function assertVenuePin(
  venueId: string,
  candidate: string | null | undefined,
): Promise<boolean> {
  const pin = String(candidate || "").trim();
  if (!/^\d{4}$/.test(pin)) return false;
  if (isMasterAdminPin(pin)) return true;
  const expected = await getVenueManagerPin(venueId);
  return Boolean(expected && pin === expected);
}

export function venuePinCookieName(venueId: string): string {
  const safeId = String(venueId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  return `${VENUE_PIN_COOKIE_PREFIX}-${safeId}`;
}
