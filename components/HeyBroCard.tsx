"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin, Navigation, Phone, ShieldCheck } from "lucide-react";
import { ManagedBadge } from "@/components/heybro/ManagedBadge";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { withLocale } from "@/lib/i18n";
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
  const transit = buildMapsUrl({
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    mode: "transit",
  });
  return (
    <article
      className={
        venue.isManaged
          ? "venue-card luxury-venue is-managed"
          : "venue-card luxury-venue"
      }
    >
      <div className="venue-image-wrap">
        <Link href={detailHref} className="venue-image-button" aria-label={name}>
          <Image
            src={venue.image}
            alt=""
            fill
            className="venue-image"
            sizes="(max-width: 820px) 50vw, 33vw"
          />
        </Link>
        <div className="venue-media-shade" aria-hidden />
        {venue.isManaged ? (
          <span className="managed-badge-slot">
            <ManagedBadge variant={venue.managedBadge || "pro"} size="sm" />
          </span>
        ) : venue.fictional ? (
          <span className="pick-badge">{t("demoBadge")}</span>
        ) : venue.verified ? (
          <span className="pick-badge">
            <ShieldCheck className="h-3 w-3" />
            {t("verified")}
          </span>
        ) : null}
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
        {venue.isManaged ? (
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
              venue.isCbd
                ? "distance-badge is-cbd"
                : "distance-badge"
            }
          >
            {venue.distanceBadge}
          </div>
        ) : null}
        <Link href={detailHref} className="venue-title">
          <h3>{name}</h3>
        </Link>
        <div className="listing-quick-badges">
          {venue.isCbd ? <span className="listing-quick-hot">CBD</span> : null}
          <span>Cash OK</span>
          <span>EFTPOS</span>
          <span>WeChat 微信</span>
          <span>Alipay</span>
          {tags.slice(0, 1).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p className="listing-snip">
          {description.length > 96 ? `${description.slice(0, 93)}…` : description}
        </p>
        <div className="venue-actions listing-cta-row">
          {venue.phone ? (
            <a
              href={`tel:${venue.phone.replace(/[^\d+]/g, "")}`}
              className="listing-cta-call"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
          ) : null}
          {venue.phone ? (
            <a
              href={`sms:${venue.phone.replace(/[^\d+]/g, "")}`}
              className="listing-cta-sms"
            >
              SMS / WeChat
            </a>
          ) : null}
          {transit ? (
            <a href={transit} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5" />
              {t("transit")}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
