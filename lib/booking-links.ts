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

export function buildWhatsAppHref(phone?: string | null, preset?: string): string | undefined {
  const number = toWhatsAppNumber(phone);
  if (!number) return undefined;
  const text = preset
    ? `?text=${encodeURIComponent(preset)}`
    : "";
  return `https://wa.me/${number}${text}`;
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
