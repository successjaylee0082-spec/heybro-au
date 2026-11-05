"use client";

import { MessageCircle, Phone } from "lucide-react";
import { WeChatQrDialog } from "@/components/heybro/WeChatQrDialog";
import type { WeChatContact } from "@/lib/booking-links";

/**
 * Day-5 mobile sticky action bar:
 * Call Now · WhatsApp Direct · WeChat Chat / QR popup
 */
export function VenueStickyCtaBar({
  phoneHref,
  whatsappHref,
  wechat,
}: {
  phoneHref?: string;
  whatsappHref?: string;
  smsHref?: string;
  wechatHref?: string;
  wechat?: WeChatContact;
  telegramHref?: string;
}) {
  const contact = wechat || { configured: false };
  if (!phoneHref && !whatsappHref) return null;

  return (
    <div
      className="venue-sticky-cta day5-sticky-cta"
      role="region"
      aria-label="Quick booking actions"
    >
      {phoneHref ? (
        <a href={phoneHref} className="sticky-cta sticky-cta-call">
          <Phone className="h-4 w-4" />
          Call Now
        </a>
      ) : null}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta sticky-cta-whatsapp"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp Direct
        </a>
      ) : null}

      <WeChatQrDialog contact={contact} />
    </div>
  );
}
