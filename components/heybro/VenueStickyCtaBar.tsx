"use client";

import { MessageCircle, Phone } from "lucide-react";

export function VenueStickyCtaBar({
  phoneHref,
  smsHref,
  wechatHref,
}: {
  phoneHref?: string;
  smsHref?: string;
  wechatHref?: string;
  telegramHref?: string;
}) {
  const bookingHref = wechatHref || smsHref;
  if (!phoneHref && !bookingHref) return null;

  return (
    <div className="venue-sticky-cta" role="region" aria-label="Quick booking actions">
      {phoneHref ? (
        <a href={phoneHref} className="sticky-cta sticky-cta-call">
          <Phone className="h-4 w-4" />
          Call Now 📞
        </a>
      ) : null}
      {bookingHref ? (
        <a href={bookingHref} className="sticky-cta sticky-cta-sms">
          <MessageCircle className="h-4 w-4" />
          SMS / WeChat Booking 📱
        </a>
      ) : phoneHref ? (
        <a href={phoneHref} className="sticky-cta sticky-cta-sms">
          <MessageCircle className="h-4 w-4" />
          SMS / WeChat Booking 📱
        </a>
      ) : null}
    </div>
  );
}
