/**
 * GA4 conversion helpers + inbound UTM attribution (sessionStorage).
 * Safe on server: no-ops when `window` is unavailable.
 */

export const UTM_STORAGE_KEY = "heybro_utm_attribution";

export type ContactType = "call" | "whatsapp" | "wechat";

export type UtmAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  captured_at: string;
};

export type VenueContactEventParams = {
  venue_id: string;
  venue_name: string;
  contact_type: ContactType;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const TRACKED_SOURCES = new Set(["reddit", "tiktok", "reels", "instagram"]);

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Capture inbound UTM query params once per session. */
export function captureUtmAttribution(
  search?: string | URLSearchParams,
): UtmAttribution | null {
  if (!isBrowser()) return null;

  try {
    const existing = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing) as UtmAttribution;
    }

    const params =
      search instanceof URLSearchParams
        ? search
        : new URLSearchParams(
            search ?? window.location.search.replace(/^\?/, ""),
          );

    const utm_source = params.get("utm_source")?.trim().toLowerCase() || undefined;
    const utm_medium = params.get("utm_medium")?.trim() || undefined;
    const utm_campaign = params.get("utm_campaign")?.trim() || undefined;
    const utm_content = params.get("utm_content")?.trim() || undefined;
    const utm_term = params.get("utm_term")?.trim() || undefined;

    if (!utm_source && !utm_medium && !utm_campaign) return null;

    const payload: UtmAttribution = {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      captured_at: new Date().toISOString(),
    };
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function readUtmAttribution(): UtmAttribution | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmAttribution;
  } catch {
    return null;
  }
}

export function trackGaEvent(
  eventName: string,
  params: Record<string, string | number | boolean | undefined>,
): void {
  if (!isBrowser()) return;
  const attribution = readUtmAttribution();
  const payload = {
    ...params,
    ...(attribution?.utm_source
      ? {
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
        }
      : {}),
  };

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  } catch {
    // Analytics must never break booking CTAs.
  }
}

/** Custom GA4 conversion for Call / WhatsApp / WeChat lead actions. */
export function trackVenueContact(params: VenueContactEventParams): void {
  trackGaEvent("venue_contact", {
    venue_id: params.venue_id,
    venue_name: params.venue_name,
    contact_type: params.contact_type,
  });

  // Named aliases for GA4 conversion configuration.
  if (params.contact_type === "call") {
    trackGaEvent("call_now_click", {
      venue_id: params.venue_id,
      venue_name: params.venue_name,
      contact_type: "call",
    });
  } else if (params.contact_type === "whatsapp") {
    trackGaEvent("whatsapp_direct_click", {
      venue_id: params.venue_id,
      venue_name: params.venue_name,
      contact_type: "whatsapp",
    });
  } else {
    trackGaEvent("wechat_qr_click", {
      venue_id: params.venue_id,
      venue_name: params.venue_name,
      contact_type: "wechat",
    });
  }
}

export function isSocialUtmSource(source?: string): boolean {
  if (!source) return false;
  return TRACKED_SOURCES.has(source.toLowerCase());
}
