export type TravelMode = "transit" | "walking" | "driving";

function hasFiniteCoord(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Build a Google Maps directions URL for a venue.
 * Prefer the street address as destination so each listing routes to its real
 * place — shared / CBD fallback pins must not override the venue address.
 */
export function buildMapsUrl(options: {
  lat?: number;
  lng?: number;
  address?: string;
  mode?: TravelMode;
}): string | null {
  const mode = options.mode ?? "transit";
  const address = options.address?.trim();
  const hasCoords = hasFiniteCoord(options.lat) && hasFiniteCoord(options.lng);

  // Address first (unique per venue). Coords only when no usable address.
  const destination = address
    ? address
    : hasCoords
      ? `${options.lat},${options.lng}`
      : undefined;

  if (!destination) return null;

  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", mode);
  if (url.toString().length > 2048) return null;
  return url.toString();
}
