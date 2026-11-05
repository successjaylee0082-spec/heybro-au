"use client";

/**
 * Standardized Canva-style venue template.
 * Slots: Hero → Hook → Quick Info → Highlights → Staff → Pricing → Gallery → Contact CTA.
 * Tier styling: free (clean) vs managed/vip ($40/mo neon elite).
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
import { VenueHookBox } from "@/components/heybro/VenueHookBox";
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
import { VIP_PLAN_LABEL } from "@/lib/venue-template";
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
          ? {
              ...badge,
              value:
                distanceKm < 1
                  ? `${Math.round(distanceKm * 1000)}m away`
                  : `${distanceKm.toFixed(1)}km away`,
            }
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
  const phoneHref = liveConsumer.phoneHref;
  const tier =
    visibility.tier || (visibility.isManaged ? "managed" : "free");
  const isPremium = tier !== "free";
  const vipChrome =
    isPremium
      ? "border border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
      : "";
  const galleryImages =
    isPremium && gallery.length
      ? gallery
      : gallery.slice(0, Math.min(gallery.length, 4));

  return (
    <article
      className={`venue-detail-page has-sticky-cta venue-template tier-${tier} ${vipChrome}`}
      data-template="canva-op"
      data-tier={tier}
    >
      <Link href={withLocale(locale, "/")} className="text-link venue-back">
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>

      {/* Slot: OP promotional hook banner — top of template */}
      <VenueHookBox visibility={visibility} />

      {/* Slot: Hero */}
      <header
        className={
          isPremium
            ? "venue-detail-header template-hero is-managed"
            : "venue-detail-header template-hero"
        }
        data-slot="hero"
      >
        <div>
          <div className="eyebrow venue-detail-eyebrow-row">
            {isPremium ? (
              <ManagedBadge
                variant={visibility.managedBadge || (tier === "vip" ? "vip" : "pro")}
                size="sm"
                showPlan
              />
            ) : (
              <span className="free-listing-chip">Free template</span>
            )}
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

      {/* Slot: Quick Info */}
      <div data-slot="quick-info" className="template-slot">
        <VenueQuickInfoBar badges={liveConsumer.quickInfo} />
      </div>

      {/* Slot: Custom highlight badges / promo */}
      <VenueHighlightWidget visibility={visibility} />

      {/* Slot: Staff roster — uniform grid */}
      <div data-slot="staff" className="template-slot template-staff">
        <VenueStaffRoster
          staff={liveConsumer.staff}
          activeCount={liveConsumer.activeStaffCount}
        />
      </div>

      {/* Slot: Course & pricing */}
      <div data-slot="pricing" className="template-slot">
        <VenueCoursePricing content={content} />
      </div>

      {/* Slot: Gallery — VIP gets fuller set */}
      <div
        data-slot="gallery"
        className={
          isPremium
            ? "template-slot template-gallery is-premium"
            : "template-slot template-gallery is-standard"
        }
      >
        <VenueGallery images={galleryImages} alt={name} />
        {!isPremium ? (
          <p className="template-upgrade-hint">
            Free listings use optimized placeholders. Upgrade to {VIP_PLAN_LABEL}{" "}
            for high-resolution custom galleries and glowing VIP chrome.
          </p>
        ) : null}
      </div>

      <div data-slot="quality" className="template-slot">
        <VenueQualityChecklist scores={liveConsumer.quality} />
      </div>

      <div className="detail-info venue-detail-meta" data-slot="contact">
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
        {venue.verified || isPremium ? (
          <span>
            <ShieldCheck />
            {isPremium ? "Elite verified" : t("verified")}
          </span>
        ) : null}
        {venue.website ? (
          <span>
            <ExternalLink />
            Official site
          </span>
        ) : null}
      </div>

      <div data-slot="overview" className="template-slot">
        <VenueStructuredContent content={content} variant="overview" />
      </div>

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

      <div className="venue-actions detail-actions template-contact-cta">
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

      <div data-slot="related" className="template-slot">
        <RelatedVenues venues={related} />
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

      {/* Day-5 sticky conversion bar: Call / WhatsApp / WeChat */}
      <VenueStickyCtaBar
        phoneHref={phoneHref}
        whatsappHref={liveConsumer.whatsappHref}
        wechat={liveConsumer.wechat}
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
export { VenueHookBox } from "@/components/heybro/VenueHookBox";
