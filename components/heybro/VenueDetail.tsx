"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { RedditShareButton } from "@/components/RedditShareButton";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { withLocale } from "@/lib/i18n";
import { buildMapsUrl } from "@/utils/googleMaps";
import type { Venue } from "@/types";

export function VenueDetail({ venue }: { venue: Venue }) {
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
    <article className="venue-detail">
      <Link href={withLocale(locale, "/")} className="text-link">
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>
      <div className="detail-photo">
        <Image src={venue.image} alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="section-heading" style={{ marginTop: 24 }}>
        <div>
          <div className="eyebrow">
            {categoryLabel(venue.category, locale)} · {suburb}
          </div>
          <h1 style={{ fontSize: 34, letterSpacing: "-1px" }}>{name}</h1>
          <p>
            {cityLabel(venue.city, locale)} · {venue.address}
          </p>
        </div>
        <Button
          type="button"
          variant={saved ? "default" : "secondary"}
          onClick={() => {
            const nowSaved = toggleSaved(venue.id);
            showToast(nowSaved ? t("savedToast") : t("removedToast"));
          }}
        >
          <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          {t("save")}
        </Button>
      </div>
      <div className="detail-info">
        <span>
          <MapPin />
          {suburb}, {cityLabel(venue.city, locale)}
        </span>
        {venue.hours ? (
          <span>
            <Clock3 />
            {venue.hours}
          </span>
        ) : null}
        {venue.verified ? (
          <span>
            <ShieldCheck />
            {t("verified")}
          </span>
        ) : null}
      </div>
      <p className="detail-body">{description}</p>
      <div className="demo-note" style={{ marginTop: 18 }}>
        This profile is a fictional demo listing. Photographs are illustrative
        interiors and are not photographs of a registered Australian business.
      </div>
      <div className="venue-actions detail-actions">
        {transit ? (
          <a href={transit} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4" />
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
            <Phone className="h-4 w-4" />
            {t("call")}
          </a>
        ) : null}
      </div>
      <div className="reddit-share-box">
        <div>
          <div className="eyebrow">
            <RedditLogo size={16} />
            REDDIT
          </div>
          <h2>{t("joinReddit")}</h2>
        </div>
        <RedditShareButton title={name} />
      </div>
    </article>
  );
}
