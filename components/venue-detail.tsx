"use client";

/**
 * Consumer venue detail layout (opistar / opiguide style).
 * Priority: Quick Info → Staff roster → Course pricing → Sticky CTA.
 */

import Link from "next/link";
import { useMemo } from "react";
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
import { VenueCoursePricing } from "@/components/heybro/VenueCoursePricing";
import { VenueGallery } from "@/components/heybro/VenueGallery";
import { VenueHighlightWidget } from "@/components/heybro/VenueHighlightWidget";
import { VenueQualityChecklist } from "@/components/heybro/VenueQualityChecklist";
import { VenueQuickInfoBar } from "@/components/heybro/VenueQuickInfoBar";
import { VenueStaffRoster } from "@/components/heybro/VenueStaffRoster";
import { VenueStickyCtaBar } from "@/components/heybro/VenueStickyCtaBar";
import { VenueStructuredContent } from "@/components/heybro/VenueStructuredContent";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { Button } from "@/components/ui/button";
import { useApproxDistanceKm } from "@/hooks/useApproxDistanceKm";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { withLocale } from "@/lib/i18n";
import type { VenueConsumerView } from "@/lib/venue-consumer";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { VenueVisibility } from "@/lib/venue-highlights";
import { buildMapsUrl } from "@/utils/googleMaps";
import type { Venue } from "@/types";

export type VenueDetailProps = {
  venue: Venue;
  gallery: string[];
  related: Venue[];
  content: ParsedVenueContent;
  visibility: VenueVisibility;
  consumer: VenueConsumerView;
};

export function VenueDetail({
  venue,
  gallery,
  related,
  content,
  visibility,
  consumer,
}: VenueDetailProps) {
  const { locale, t } = useCopy();
  const { isSaved, toggleSaved, showToast } = useNavigation();
  const saved = isSaved(venue.id);
  const name = locale === "zh" && venue.nameZh ? venue.nameZh : venue.name;
  const suburb =
    locale === "zh" && venue.suburbZh ? venue.suburbZh : venue.suburb;
  const distanceKm = useApproxDistanceKm(venue.lat, venue.lng);
  const liveConsumer = useMemo(() => {
    if (distanceKm == null) return consumer;
    return {
      ...consumer,
      quickInfo: consumer.quickInfo.map((badge) =>
        badge.kind === "location"
          ? { ...badge, value: `${distanceKm.toFixed(1)}km away` }
          : badge,
      ),
    };
  }, [consumer, distanceKm]);

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
  const phoneHref = tel ? `tel:${tel}` : undefined;

  return (
    <article className="venue-detail-page has-sticky-cta opiguide-layout">
      <Link href={withLocale(locale, "/")} className="text-link venue-back">
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>

      {/* 1) Hero Quick Info badge bar — always first */}
      <VenueQuickInfoBar badges={liveConsumer.quickInfo} />
      <VenueHighlightWidget visibility={visibility} />

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
          {phoneHref ? (
            <a href={phoneHref} className="venue-primary-cta">
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

      {/* 2) Staff roster — ahead of gallery / long copy */}
      <VenueStaffRoster
        staff={liveConsumer.staff}
        activeCount={liveConsumer.activeStaffCount}
      />

      {/* 3) Course & pricing — 2-col mobile cards */}
      <VenueCoursePricing content={content} />

      <VenueGallery images={gallery} alt={name} />
      <VenueQualityChecklist scores={liveConsumer.quality} />

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

      <VenueStructuredContent content={content} variant="overview" />

      {venue.fictional ? (
        <div className="demo-note" style={{ marginTop: 18 }}>
          This profile is a fictional demo listing. Photographs are illustrative
          interiors and are not photographs of a registered Australian business.
        </div>
      ) : (
        <div className="demo-note venue-photo-note">
          Staff cards may blend venue media with illustrative portraits when
          source profiles are limited. Always confirm availability by phone.
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
        {phoneHref ? (
          <a href={phoneHref}>
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

      {/* 4) Sticky conversion bar */}
      <VenueStickyCtaBar
        phoneHref={phoneHref}
        smsHref={liveConsumer.smsHref}
        wechatHref={liveConsumer.wechatHref}
      />
    </article>
  );
}

export { VenueDetail as VenueDetailPage };
export { VenueQuickInfoBar } from "@/components/heybro/VenueQuickInfoBar";
export { VenueStaffRoster } from "@/components/heybro/VenueStaffRoster";
export { VenueCoursePricing } from "@/components/heybro/VenueCoursePricing";
export { VenueQualityChecklist } from "@/components/heybro/VenueQualityChecklist";
export { VenueStickyCtaBar } from "@/components/heybro/VenueStickyCtaBar";
