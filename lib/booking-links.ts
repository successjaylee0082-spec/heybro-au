/**
 * Build consumer booking deep-links for Call / WhatsApp / WeChat.
 */

export function normalizePhoneDigits(phone?: string | null): string | undefined {
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

/** Platform admin / support WhatsApp (public env preferred). */
export function getPlatformWhatsAppNumber(): string | undefined {
  return toWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER ||
      process.env.WHATSAPP_SUPPORT_NUMBER ||
      process.env.NEXT_PUBLIC_PLATFORM_WHATSAPP ||
      undefined,
  );
}

/**
 * Prefer a venue-specific WhatsApp / phone, then fall back to platform support.
 */
export function resolveWhatsAppNumber(
  venueNumber?: string | null,
): string | undefined {
  return toWhatsAppNumber(venueNumber) || getPlatformWhatsAppNumber();
}

export function buildWhatsAppHref(
  phone?: string | null,
  preset?: string,
): string | undefined {
  const number = resolveWhatsAppNumber(phone);
  if (!number) return undefined;
  const text = preset ? `?text=${encodeURIComponent(preset)}` : "";
  return `https://wa.me/${number}${text}`;
}

export function buildVenueInquiryWhatsAppHref(options: {
  venueName: string;
  whatsapp?: string | null;
  phone?: string | null;
}): string | undefined {
  return buildWhatsAppHref(
    options.whatsapp || options.phone,
    `Hello, I would like to inquire about availability at ${options.venueName}.`,
  );
}

export function buildAdminSupportWhatsAppHref(options?: {
  venueName?: string;
  venueId?: string;
}): string | undefined {
  const number = getPlatformWhatsAppNumber();
  if (!number) return undefined;
  const venueBit = options?.venueName
    ? ` for ${options.venueName}${options.venueId ? ` (${options.venueId})` : ""}`
    : "";
  return `https://wa.me/${number}?text=${encodeURIComponent(
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
