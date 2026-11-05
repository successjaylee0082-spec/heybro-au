"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { RedditShareButton } from "@/components/RedditShareButton";
import { ManagedBadge } from "@/components/heybro/ManagedBadge";
import { RelatedVenues } from "@/components/heybro/RelatedVenues";
import { VenueGallery } from "@/components/heybro/VenueGallery";
import { VenueHighlightWidget } from "@/components/heybro/VenueHighlightWidget";
import { VenueStructuredContent } from "@/components/heybro/VenueStructuredContent";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { categoryLabel, cityLabel } from "@/lib/cities";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { VenueVisibility } from "@/lib/venue-highlights";
import { withLocale } from "@/lib/i18n";
import { buildMapsUrl } from "@/utils/googleMaps";
import type { Venue } from "@/types";

export function VenueDetail({
  venue,
  gallery,
  related,
  content,
  visibility,
}: {
  venue: Venue;
  gallery: string[];
  related: Venue[];
  content: ParsedVenueContent;
  visibility: VenueVisibility;
}) {
  const { locale, t } = useCopy();
  const { isSaved, toggleSaved, showToast } = useNavigation();
  const saved = isSaved(venue.id);
  const name = locale === "zh" && venue.nameZh ? venue.nameZh : venue.name;
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
  const tel = venue.phone?.replace(/[^\d+]/g, "");

  return (
    <article className="venue-detail-page">
      <Link href={withLocale(locale, "/")} className="text-link venue-back">
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>

      <VenueHighlightWidget visibility={visibility} />

      <VenueGallery images={gallery} alt={name} />

      <header
        className={
          visibility.isManaged
            ? "venue-detail-header is-managed"
            : "venue-detail-header"
        }
      >
        <div>
          <div className="eyebrow venue-detail-eyebrow-row">
            {visibility.isManaged ? (
              <ManagedBadge variant={visibility.managedBadge || "pro"} size="sm" />
            ) : null}
            <span>
              {categoryLabel(venue.category, locale)} · {suburb}
            </span>
          </div>
          <h1>{name}</h1>
          <p>
            {cityLabel(venue.city, locale)} · {venue.address}
          </p>
        </div>
        <div className="venue-detail-header-actions">
          <Button
            type="button"
            variant={saved ? "default" : "secondary"}
            onClick={() => {
              const nowSaved = toggleSaved(venue.id);
              showToast(nowSaved ? t("savedToast") : t("removedToast"));
            }}
          >
            <Bookmark
              className="h-4 w-4"
              fill={saved ? "currentColor" : "none"}
            />
            {t("save")}
          </Button>
          {tel ? (
            <a href={`tel:${tel}`} className="venue-primary-cta">
              <Phone className="h-4 w-4" />
              Call Now
            </a>
          ) : null}
          {venue.website ? (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="venue-secondary-cta"
            >
              <Globe2 className="h-4 w-4" />
              Website
            </a>
          ) : null}
        </div>
      </header>

      <div className="detail-info venue-detail-meta">
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
        {venue.website ? (
          <span>
            <ExternalLink />
            Official site
          </span>
        ) : null}
      </div>

      <VenueStructuredContent content={content} />

      {venue.fictional ? (
        <div className="demo-note" style={{ marginTop: 18 }}>
          This profile is a fictional demo listing. Photographs are illustrative
          interiors and are not photographs of a registered Australian business.
        </div>
      ) : (
        <div className="demo-note venue-photo-note">
          Gallery photos may include venue media and illustrative lifestyle
          imagery used when a listing has limited source photography.
        </div>
      )}

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
        {tel ? (
          <a href={`tel:${tel}`}>
            <Phone className="h-4 w-4" />
            {t("call")}
          </a>
        ) : null}
      </div>

      <RelatedVenues venues={related} />

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
