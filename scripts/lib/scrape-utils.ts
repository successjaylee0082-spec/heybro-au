import { createHash } from "node:crypto";

/** Chrome-like desktop UA used for listing + detail fetches. */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function userAgent(): string {
  return UA;
}

/** Common browser request headers paired with the spoofed UA. */
export function browserHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "User-Agent": userAgent(),
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    ...extra,
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function absoluteUrl(href: string, base = "https://brothels.com.au"): string {
  try {
    const url = new URL(href, base);
    url.hash = "";
    return url.toString();
  } catch {
    return href;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function slugFromSourceUrl(sourceUrl: string, name: string): string {
  try {
    const path = new URL(sourceUrl).pathname.replace(/\/+$/, "");
    const leaf = path.split("/").filter(Boolean).pop();
    if (leaf && leaf !== "brothel" && !/^\?/.test(leaf)) {
      return slugify(decodeURIComponent(leaf));
    }
  } catch {
    // fall through
  }
  const fromName = slugify(name);
  if (fromName) return fromName;
  return createHash("sha1").update(sourceUrl).digest("hex").slice(0, 12);
}

export function sourceIdFromUrl(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    const p = url.searchParams.get("p");
    if (p) return p;
    const leaf = url.pathname.replace(/\/+$/, "").split("/").pop();
    return leaf || null;
  } catch {
    return null;
  }
}

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.length < 8) return null;
  return trimmed;
}

export function parseAustralianAddress(address: string | null): {
  suburb: string | null;
  postcode: string | null;
  state: "NSW" | null;
} {
  if (!address) return { suburb: null, postcode: null, state: null };
  const postcodeMatch = address.match(/\b(2\d{3})\b/);
  const postcode = postcodeMatch?.[1] ?? null;
  const state = /\bNSW\b/i.test(address) ? "NSW" : null;
  // e.g. "50 Kellett St, Potts Point NSW 2011"
  const suburbMatch = address.match(
    /,\s*([A-Za-z][A-Za-z\s'-]+?)\s+(?:NSW|New South Wales)\b/i,
  );
  let suburb = suburbMatch?.[1]?.trim() ?? null;
  if (!suburb) {
    // "EDGECLIFF, SYDNEY NSW" style
    const edge = address.match(/^([A-Za-z][A-Za-z\s'-]+?)\s*,\s*SYDNEY/i);
    suburb = edge?.[1]?.trim() ?? null;
  }
  if (suburb) {
    suburb = suburb
      .toLowerCase()
      .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
  }
  return { suburb, postcode, state };
}

export function isLikelyStaffImage(url: string, alt = ""): boolean {
  const hay = `${url} ${alt}`.toLowerCase();
  if (!/wp-content\/uploads|\.jpe?g|\.png|\.webp/.test(hay)) return false;
  if (
    /logo|icon|banner|plugin|emoji|skin|revslider|feature|open_24|drinks|spa|location|computer|mobile|essentials/.test(
      hay,
    )
  ) {
    return false;
  }
  return /girl|staff|lady|model|roster|talent|escort|portrait|profile/.test(hay);
}

export function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.replace(/\s+/g, " ").trim();
  return text || null;
}
