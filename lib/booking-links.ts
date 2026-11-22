/**
 * Build consumer booking deep-links for Call / WhatsApp / WeChat.
 */

/** Canonical Hey Bro inquiry WhatsApp (AU international, no +). */
export const HEYBRO_WHATSAPP_NUMBER = "61435901095";

/** Official Business Sales / Partners / venue inquiry WhatsApp deep link. */
export const BUSINESS_WHATSAPP_HREF = `https://wa.me/${HEYBRO_WHATSAPP_NUMBER}`;

export function normalizePhoneDigits(
  phone?: string | null,
): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return undefined;
  return digits;
}

/** Convert AU local numbers to WhatsApp international format (no +). */
export function toWhatsAppNumber(phone?: string | null): string | undefined {
  const raw = normalizePhoneDigits(phone);
  if (!raw) return undefined;
  let digits = raw.replace(/^\+/, "");
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `61${digits.slice(1)}`;
  }
  if (!/^\d{8,15}$/.test(digits)) return undefined;
  return digits;
}

/** Platform admin / support WhatsApp — always Hey Bro inquiry number. */
export function getPlatformWhatsAppNumber(): string {
  return HEYBRO_WHATSAPP_NUMBER;
}

/**
 * All site WhatsApp inquiry links route to the unified Hey Bro number.
 * Venue phones remain for Call / SMS only.
 */
export function resolveWhatsAppNumber(
  _venueNumber?: string | null,
): string {
  return HEYBRO_WHATSAPP_NUMBER;
}

export function buildWhatsAppHref(
  _phone?: string | null,
  preset?: string,
): string {
  const text = preset ? `?text=${encodeURIComponent(preset)}` : "";
  return `https://wa.me/${HEYBRO_WHATSAPP_NUMBER}${text}`;
}

export function buildVenueInquiryWhatsAppHref(options: {
  venueName: string;
  whatsapp?: string | null;
  phone?: string | null;
}): string {
  return buildWhatsAppHref(
    options.whatsapp || options.phone,
    `Hello, I would like to inquire about availability at ${options.venueName}.`,
  );
}

export function buildAdminSupportWhatsAppHref(options?: {
  venueName?: string;
  venueId?: string;
}): string {
  const venueBit = options?.venueName
    ? ` for ${options.venueName}${options.venueId ? ` (${options.venueId})` : ""}`
    : "";
  return `https://wa.me/${HEYBRO_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello Hey Bro admin — I need support${venueBit}.`,
  )}`;
}

export function buildTelHref(phone?: string | null): string | undefined {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:${digits}` : undefined;
}

export function buildSmsHref(phone?: string | null): string | undefined {
  const digits = normalizePhoneDigits(phone);
  return digits ? `sms:${digits}` : undefined;
}

export type WeChatContact = {
  id?: string;
  qrSrc?: string;
  configured: boolean;
};

export function resolveWeChatContact(options: {
  wechatId?: string | null;
  qrPath?: string | null;
}): WeChatContact {
  const id = options.wechatId?.trim() || undefined;
  const qrSrc = options.qrPath?.trim() || undefined;
  return {
    id,
    qrSrc,
    configured: Boolean(id),
  };
}
