export type TravelMode = "transit" | "walking" | "driving";

export function buildMapsUrl(options: {
  lat?: number;
  lng?: number;
  address?: string;
  mode?: TravelMode;
}): string | null {
  const mode = options.mode ?? "transit";
  const hasCoords =
    typeof options.lat === "number" &&
    Number.isFinite(options.lat) &&
    typeof options.lng === "number" &&
    Number.isFinite(options.lng);
  const destination = hasCoords
    ? `${options.lat},${options.lng}`
    : options.address?.trim();
  if (!destination) return null;
  const url = new URL("https://www.google.com/maps/dir/?api=1");
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", mode);
  if (url.toString().length > 2048) return null;
  return url.toString();
}
