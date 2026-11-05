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

const TAG_PILL =
  "inline-flex items-center px-2.5 py-1 text-xs rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 whitespace-nowrap";
const TAG_PILL_HOT =
  "inline-flex items-center px-2.5 py-1 text-xs rounded-md bg-rose-950/60 text-rose-200 border border-rose-700/50 whitespace-nowrap";
const CTA_BASE =
  "inline-flex items-center justify-center gap-1.5 min-h-9 px-3 text-xs font-semibold rounded-md border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-rose-500/60";

/**
 * Roster / directory card — masked pose cover with spaced tag pills and
 * non-overlapping CTA / badge rows (Tailwind structure, no globals edits).
 */
export function VenueCard({ venue }: { venue: Venue }) {
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
  const paymentTags = Array.from(
    new Set([
      ...chips,
      ...(vip ? tags.slice(0, 1) : []),
      ...(venue.profile?.payments || []).map((payment) =>
        payment
          .replace("WeChat Pay 微信", "WeChat")
          .replace("Alipay 支付宝", "Alipay")
          .replace("Cash OK", "Cash OK")
          .replace("Discreet Parking", "Parking"),
      ),
    ]),
  ).filter(Boolean);

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
      <div className="venue-image-wrap relative">
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

        {/* Verification badges — clear of title/description via absolute media slot */}
        <div className="managed-badge-slot absolute left-3 top-3 z-[2] flex flex-row flex-wrap items-center gap-2">
          {vip ? (
            <ManagedBadge
              variant={venue.managedBadge || (tier === "vip" ? "vip" : "pro")}
              size="sm"
            />
          ) : (
            <span className="free-listing-tag">Free listing</span>
          )}
        </div>

        <button
          type="button"
          className={
            saved
              ? "save-button is-saved absolute right-3 top-3 z-[2]"
              : "save-button absolute right-3 top-3 z-[2]"
          }
          aria-label={t("save")}
          onClick={() => {
            const nowSaved = toggleSaved(venue.id);
            showToast(nowSaved ? t("savedToast") : t("removedToast"));
          }}
        >
          <Bookmark
            className="h-3.5 w-3.5"
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        <span className="image-category absolute bottom-3 right-3 z-[2]">
          {categoryLabel(venue.category, locale)}
        </span>
        {vip ? (
          <span className="venue-live-pill absolute bottom-3 left-3 z-[2]">
            <i className="status-live-dot" aria-hidden />
            Active Now
          </span>
        ) : null}
      </div>

      <div className="venue-content flex flex-col gap-2 p-4">
        <div className="flex flex-row flex-wrap items-center gap-2">
          <div className="venue-location inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>
              {suburb}, {cityLabel(venue.city, locale)}
            </span>
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
        </div>

        <Link href={detailHref} className="venue-title block">
          <h3 className="m-0 leading-snug">{name}</h3>
        </Link>

        {/* Payment / amenity pills — flex-wrap + gap so labels never concatenate */}
        <div
          className="listing-quick-badges flex flex-wrap gap-2 mt-2"
          aria-label="Payments and amenities"
        >
          {paymentTags.map((chip) => (
            <span
              key={chip}
              className={chip === "CBD" ? TAG_PILL_HOT : TAG_PILL}
            >
              {chip}
            </span>
          ))}
        </div>

        <p className="listing-snip m-0 text-sm text-neutral-400">
          {description.length > (vip ? 110 : 72)
            ? `${description.slice(0, vip ? 107 : 69)}…`
            : description}
        </p>

        {/* Contact CTAs — spaced flex row, wraps cleanly on mobile */}
        <div className="venue-actions listing-cta-row mt-3 flex flex-row flex-wrap items-center gap-3">
          {vip && phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className={`${CTA_BASE} listing-cta-call`}
            >
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
          ) : null}
          {vip && whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CTA_BASE} listing-cta-whatsapp`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : null}
          {vip ? (
            <WeChatQrDialog
              contact={wechat}
              triggerClassName={`${CTA_BASE} listing-cta-wechat`}
              label="WeChat"
            />
          ) : null}
          {!vip ? (
            <Link href={detailHref} className={`${CTA_BASE} listing-cta-view`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              View details
            </Link>
          ) : null}
          {transit ? (
            <a
              href={transit}
              target="_blank"
              rel="noopener noreferrer"
              className={CTA_BASE}
            >
              <Navigation className="h-3.5 w-3.5" />
              {t("transit")}
            </a>
          ) : null}
        </div>

        {!vip ? (
          <p className="listing-upgrade-hint mt-1 mb-0 text-xs text-neutral-500">
            Messaging unlocks on Business VIP · $40/mo
          </p>
        ) : null}
      </div>
    </article>
  );
}

export { VenueCard as HeyBroCard };
