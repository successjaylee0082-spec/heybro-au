"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ManagedBadge } from "@/components/heybro/ManagedBadge";
import { WeChatQrDialog } from "@/components/heybro/WeChatQrDialog";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { buildWhatsAppHref, resolveWeChatContact } from "@/lib/booking-links";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { resolveCardPoseCover } from "@/lib/directory-covers";
import { withLocale } from "@/lib/i18n";
import {
  isVipListing,
  resolveVenueListingTier,
} from "@/lib/listing-tier";
import { listingServiceChips } from "@/lib/venue-profiles";
import { buildMapsUrl } from "@/utils/googleMaps";
import type { Venue } from "@/types";

export function HeyBroCard({ venue }: { venue: Venue }) {
  const { locale, t } = useCopy();
  const { isSaved, toggleSaved, showToast } = useNavigation();
  const saved = isSaved(venue.id);
  const name = locale === "zh" && venue.nameZh ? venue.nameZh : venue.name;
  const description =
    locale === "zh" && venue.descriptionZh
      ? venue.descriptionZh
      : venue.description;
  const suburb =
    locale === "zh" && venue.suburbZh ? venue.suburbZh : venue.suburb;
  const tags =
    locale === "zh" && venue.tagsZh?.length ? venue.tagsZh : venue.tags;
  const detailHref = withLocale(locale, `/venue/${venue.id}`);
  const cover = resolveCardPoseCover(venue.id, venue.image);
  const vip = isVipListing(venue);
  const tier = resolveVenueListingTier(venue);
  const transit = buildMapsUrl({
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    mode: "transit",
  });
  const phoneDigits = venue.phone?.replace(/[^\d+]/g, "") || "";
  const whatsappHref = vip
    ? buildWhatsAppHref(
        venue.customHighlights?.whatsapp || venue.phone,
        `Hi, I found ${venue.name} on Hey Bro — are you available tonight?`,
      )
    : undefined;
  const wechat = vip
    ? resolveWeChatContact({
        wechatId: venue.customHighlights?.wechat || undefined,
        qrPath: venue.customHighlights?.wechat
          ? "/images/wechat-qr.png"
          : null,
      })
    : { configured: false as const };

  const chips = vip
    ? listingServiceChips(venue)
    : listingServiceChips(venue).slice(0, 3);

  return (
    <article
      className={
        vip
          ? `venue-card luxury-venue is-managed is-vip tier-${tier}`
          : "venue-card luxury-venue is-free tier-free"
      }
      data-cover="masked-pose"
      data-tier={tier}
    >
      <div className="venue-image-wrap">
        <Link href={detailHref} className="venue-image-button" aria-label={name}>
          <Image
            src={cover}
            alt=""
            fill
            quality={90}
            className="venue-image object-cover object-[center_20%]"
            sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 420px"
          />
        </Link>
        <div className="venue-media-shade" aria-hidden />
        {vip ? (
          <span className="managed-badge-slot">
            <ManagedBadge
              variant={venue.managedBadge || (tier === "vip" ? "vip" : "pro")}
              size="sm"
            />
          </span>
        ) : (
          <span className="free-listing-tag">Free listing</span>
        )}
        <button
          type="button"
          className={saved ? "save-button is-saved" : "save-button"}
          aria-label={t("save")}
          onClick={() => {
            const nowSaved = toggleSaved(venue.id);
            showToast(nowSaved ? t("savedToast") : t("removedToast"));
          }}
        >
          <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="image-category">
          {categoryLabel(venue.category, locale)}
        </span>
        {vip ? (
          <span className="venue-live-pill">
            <i className="status-live-dot" aria-hidden />
            Active Now
          </span>
        ) : null}
      </div>
      <div className="venue-content">
        <div className="venue-location">
          <MapPin className="h-3 w-3" />
          {suburb}, {cityLabel(venue.city, locale)}
        </div>
        {venue.distanceBadge ? (
          <div
            className={
              venue.isCbd ? "distance-badge is-cbd" : "distance-badge"
            }
          >
            {venue.distanceBadge}
          </div>
        ) : null}
        <Link href={detailHref} className="venue-title">
          <h3>{name}</h3>
        </Link>
        <div className="listing-quick-badges">
          {chips.map((chip) =>
            chip === "CBD" ? (
              <span key={chip} className="listing-quick-hot">
                CBD
              </span>
            ) : (
              <span key={chip}>{chip}</span>
            ),
          )}
          {vip
            ? tags.slice(0, 1).map((tag) => <span key={tag}>{tag}</span>)
            : null}
        </div>
        <p className="listing-snip">
          {description.length > (vip ? 110 : 72)
            ? `${description.slice(0, vip ? 107 : 69)}…`
            : description}
        </p>
        <div className="venue-actions listing-cta-row">
          {vip && phoneDigits ? (
            <a href={`tel:${phoneDigits}`} className="listing-cta-call">
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
          ) : null}
          {vip && whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="listing-cta-whatsapp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : null}
          {vip ? (
            <WeChatQrDialog
              contact={wechat}
              triggerClassName="listing-cta-wechat"
              label="WeChat"
            />
          ) : null}
          {!vip ? (
            <Link href={detailHref} className="listing-cta-view">
              <ShieldCheck className="h-3.5 w-3.5" />
              View details
            </Link>
          ) : null}
          {transit ? (
            <a href={transit} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5" />
              {t("transit")}
            </a>
          ) : null}
        </div>
        {!vip ? (
          <p className="listing-upgrade-hint">
            Messaging unlocks on Business VIP · $40/mo
          </p>
        ) : null}
      </div>
    </article>
  );
}
