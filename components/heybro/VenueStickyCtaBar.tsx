"use client";

import { MessageCircle, Phone } from "lucide-react";
import { WeChatQrDialog } from "@/components/heybro/WeChatQrDialog";
import type { WeChatContact } from "@/lib/booking-links";

/**
 * Day-5 mobile sticky bottom action bar.
 * Branded CTAs: Call Now · WhatsApp Direct · WeChat Chat / QR popup
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
  const contact = wechat ?? { configured: false };
  if (!phoneHref && !whatsappHref && !contact.configured) return null;

  return (
    <div
      className="venue-sticky-cta day5-sticky-cta"
      role="region"
      aria-label="Mobile booking actions"
    >
      {phoneHref ? (
        <a href={phoneHref} className="sticky-cta sticky-cta-call">
          <Phone className="h-4 w-4" aria-hidden />
          <span>📞 Call Now</span>
        </a>
      ) : (
        <span className="sticky-cta sticky-cta-disabled" aria-disabled="true">
          📞 Call Now
        </span>
      )}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta sticky-cta-whatsapp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span>💬 WhatsApp Direct</span>
        </a>
      ) : (
        <span className="sticky-cta sticky-cta-disabled" aria-disabled="true">
          💬 WhatsApp
        </span>
      )}

      <WeChatQrDialog
        contact={contact}
        triggerClassName="sticky-cta sticky-cta-wechat"
        label="🟢 WeChat Chat"
      />
    </div>
  );
}
