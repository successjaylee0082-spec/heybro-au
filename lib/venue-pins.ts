/**
 * Simple 4-digit venue owner PIN map.
 * Override any entry with VENUE_PIN_<ID> (e.g. VENUE_PIN_MELB_1=8899)
 * or a JSON blob in VENUE_OWNER_PINS.
 */

export const DEFAULT_VENUE_PINS: Record<string, string> = {
  "melb-1": "8899",
  "melb-2": "8899",
  "melb-3": "8899",
  "melb-4": "8899",
  "melb-5": "8899",
};

function envPinOverrides(): Record<string, string> {
  const out: Record<string, string> = {};
  const json = process.env.VENUE_OWNER_PINS?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as Record<string, string>;
      for (const [key, value] of Object.entries(parsed)) {
        if (/^\d{4}$/.test(String(value))) out[key] = String(value);
      }
    } catch {
      // ignore malformed JSON
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    const match = /^VENUE_PIN_(.+)$/.exec(key);
    if (!match || !value) continue;
    const venueId = match[1].toLowerCase().replace(/_/g, "-");
    if (/^\d{4}$/.test(value.trim())) out[venueId] = value.trim();
  }
  return out;
}

export function getVenuePin(venueId: string): string | null {
  const id = String(venueId || "").trim();
  if (!id) return null;
  const pins = { ...DEFAULT_VENUE_PINS, ...envPinOverrides() };
  return pins[id] || null;
}

export function assertVenuePin(
  venueId: string,
  candidate: string | null | undefined,
): boolean {
  const expected = getVenuePin(venueId);
  return Boolean(expected && candidate && candidate === expected);
}

export const VENUE_PIN_COOKIE_PREFIX = "heybro-venue-pin";

export function venuePinCookieName(venueId: string): string {
  return `${VENUE_PIN_COOKIE_PREFIX}:${venueId}`;
}
