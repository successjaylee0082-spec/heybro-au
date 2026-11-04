"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin, Navigation, Phone, ShieldCheck } from "lucide-react";
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
  const walking = buildMapsUrl({
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    mode: "walking",
  });

  return (
    <article className="venue-card">
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
        <span className="pick-badge">
          {venue.verified ? (
            <>
              <ShieldCheck className="h-3 w-3" />
              {t("verified")}
            </>
          ) : (
            t("demoBadge")
          )}
        </span>
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
      </div>
      <div className="venue-content">
        <div className="venue-location">
          <MapPin className="h-3 w-3" />
          {suburb}, {cityLabel(venue.city, locale)}
        </div>
        <Link href={detailHref} className="venue-title">
          <h3>{name}</h3>
        </Link>
        <p>{description}</p>
        <div className="venue-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="venue-actions">
          {transit ? (
            <a href={transit} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5" />
              {t("transit")}
            </a>
          ) : null}
          {walking ? (
            <a href={walking} target="_blank" rel="noopener noreferrer">
              {t("walking")}
            </a>
          ) : null}
          {venue.phone ? (
            <a href={`tel:${venue.phone}`}>
              <Phone className="h-3.5 w-3.5" />
              {t("call")}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
