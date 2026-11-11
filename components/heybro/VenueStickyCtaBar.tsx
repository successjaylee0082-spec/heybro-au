"use client";

import { MessageCircle, Phone } from "lucide-react";
import { WeChatQrDialog } from "@/components/heybro/WeChatQrDialog";
import { trackVenueContact } from "@/lib/analytics";
import type { WeChatContact } from "@/lib/booking-links";
import { VIP_MONTHLY_PRICE } from "@/lib/listing-tier";

/**
 * Mobile sticky bottom action bar for TikTok / Reels / Reddit traffic.
 * Branded CTAs: Call Now · WhatsApp Direct · WeChat QR
 */
export function VenueStickyCtaBar({
  phoneHref,
  whatsappHref,
  wechat,
  isVip = false,
  upgradeHref,
  venueId,
  venueName,
}: {
  phoneHref?: string;
  whatsappHref?: string;
  smsHref?: string;
  wechatHref?: string;
  wechat?: WeChatContact;
  telegramHref?: string;
  /** Direct messaging CTAs only unlock on Business VIP / managed listings. */
  isVip?: boolean;
  upgradeHref?: string;
  venueId?: string;
  venueName?: string;
}) {
  const contact = wechat ?? { configured: false };
  const track = (contact_type: "call" | "whatsapp" | "wechat") => {
    if (!venueId || !venueName) return;
    trackVenueContact({
      venue_id: venueId,
      venue_name: venueName,
      contact_type,
    });
  };

  if (!isVip) {
    return (
      <div
        className="venue-sticky-cta day5-sticky-cta is-free"
        role="region"
        aria-label="Upgrade to unlock messaging"
      >
        {phoneHref ? (
          <a
            href={phoneHref}
            className="sticky-cta sticky-cta-call min-h-12 touch-manipulation"
            onClick={() => track("call")}
          >
            <Phone className="h-4 w-4" aria-hidden />
            <span>Call venue</span>
          </a>
        ) : (
          <span className="sticky-cta sticky-cta-disabled" aria-disabled="true">
            Call venue
          </span>
        )}
        <a
          href={upgradeHref || "/partners#vip-upgrade"}
          className="sticky-cta sticky-cta-upgrade min-h-12 touch-manipulation"
        >
          Unlock VIP messaging · {VIP_MONTHLY_PRICE}
        </a>
      </div>
    );
  }

  if (!phoneHref && !whatsappHref && !contact.configured) return null;

  return (
    <div
      className="venue-sticky-cta day5-sticky-cta is-vip"
      role="region"
      aria-label="Mobile booking actions"
    >
      {phoneHref ? (
        <a
          href={phoneHref}
          className="sticky-cta sticky-cta-call min-h-12 touch-manipulation"
          onClick={() => track("call")}
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span>Call Now</span>
        </a>
      ) : (
        <span className="sticky-cta sticky-cta-disabled" aria-disabled="true">
          Call Now
        </span>
      )}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta sticky-cta-whatsapp min-h-12 touch-manipulation"
          onClick={() => track("whatsapp")}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          <span>WhatsApp Direct</span>
        </a>
      ) : (
        <span className="sticky-cta sticky-cta-disabled" aria-disabled="true">
          WhatsApp Direct
        </span>
      )}

      <WeChatQrDialog
        contact={contact}
        triggerClassName="sticky-cta sticky-cta-wechat min-h-12 touch-manipulation"
        label="WeChat QR"
        onOpen={() => track("wechat")}
      />
    </div>
  );
}
