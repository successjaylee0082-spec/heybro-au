"use client";

import { MessageCircle, Phone, Send } from "lucide-react";

export function VenueStickyCtaBar({
  phoneHref,
  smsHref,
  telegramHref,
}: {
  phoneHref?: string;
  smsHref?: string;
  telegramHref?: string;
}) {
  if (!phoneHref && !smsHref && !telegramHref) return null;

  return (
    <div className="venue-sticky-cta" role="region" aria-label="Quick booking actions">
      {phoneHref ? (
        <a href={phoneHref} className="sticky-cta sticky-cta-call">
          <Phone className="h-4 w-4" />
          전화 문의 · Call Now
        </a>
      ) : null}
      {smsHref ? (
        <a href={smsHref} className="sticky-cta sticky-cta-sms">
          <MessageCircle className="h-4 w-4" />
          SMS 예약
        </a>
      ) : null}
      {telegramHref ? (
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-cta sticky-cta-telegram"
        >
          <Send className="h-4 w-4" />
          Telegram
        </a>
      ) : (
        !smsHref && phoneHref ? (
          <a href={phoneHref} className="sticky-cta sticky-cta-sms">
            <MessageCircle className="h-4 w-4" />
            빠른 예약
          </a>
        ) : null
      )}
    </div>
  );
}
