"use client";

/**
 * Standardized Canva-style venue template.
 * Slots: Hero → Hook → Quick Info → Highlights → Staff → Pricing → Gallery → Contact CTA.
 * Tier styling: Basic ($49) vs Managed VIP Elite ($149) vs Enterprise ($249).
 */

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { RedditShareButton } from "@/components/RedditShareButton";
import { RelatedVenues } from "@/components/heybro/RelatedVenues";
import { VenueCoursePricing } from "@/components/heybro/VenueCoursePricing";
import { VenueGallery } from "@/components/heybro/VenueGallery";
import { VenueHeroBanner } from "@/components/heybro/VenueHeroBanner";
import { VenueHighlightWidget } from "@/components/heybro/VenueHighlightWidget";
import { VenueQualityChecklist } from "@/components/heybro/VenueQualityChecklist";
import { VenueQuickInfoBar } from "@/components/heybro/VenueQuickInfoBar";
import { VenueStaffRoster } from "@/components/heybro/VenueStaffRoster";
import { VenueStickyCtaBar } from "@/components/heybro/VenueStickyCtaBar";
import { VenueStructuredContent } from "@/components/heybro/VenueStructuredContent";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { useApproxDistanceKm } from "@/hooks/useApproxDistanceKm";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { withLocale } from "@/lib/i18n";
import {
  buildStaffRoster,
  type VenueConsumerView,
} from "@/lib/venue-consumer";
import { trackVenueContact } from "@/lib/analytics";
import {
  forceSafeAge,
  sanitizeCompanionList,
} from "@/lib/companion-profile";
import {
  formatPricingRateLine,
  minimumCoursePrice,
  resolveVenuePricing,
  withVenuePricing,
} from "@/lib/data";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { VenueVisibility } from "@/lib/venue-highlights";
import {
  isVipListing,
  resolveVenueListingTier,
  VIP_BADGE_ELITE,
  VIP_BADGE_ENTERPRISE,
} from "@/lib/listing-tier";
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
    // Prefer official English companion strings from venue.ladies — never placeholders.
    const rosterFromLadies = sanitizeCompanionList(
      (Array.isArray(venue.ladies) && venue.ladies.length > 0
        ? buildStaffRoster({
            venueId: venue.id,
            ladies: venue.ladies,
            managed: venue.isManaged,
          })
        : consumer.staff
      ).map((member) => {
        const displayAge = Math.max(21, Number(member.age) || 21);
        return {
          ...member,
          age: forceSafeAge(displayAge),
        };
      }),
    );
    const activeStaffCount = rosterFromLadies.filter(
      (member) => member.status === "active",
    ).length;
    const withRoster = {
      ...consumer,
      staff: rosterFromLadies,
      activeStaffCount,
      quickInfo: consumer.quickInfo.map((badge) =>
        badge.kind === "staff"
          ? {
              ...badge,
              value: `${activeStaffCount} Ladies`,
            }
          : badge,
      ),
    };
    if (distanceKm == null) return withRoster;
    return {
      ...withRoster,
      quickInfo: withRoster.quickInfo.map((badge) =>
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
  }, [consumer, distanceKm, venue.id, venue.isManaged, venue.ladies]);

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
  const listingTier = resolveVenueListingTier(venue);
  const tier =
    visibility.tier ||
    listingTier ||
    (visibility.isManaged ? "managed" : "free");
  const isPremium =
    tier !== "free" ||
    venue.badgeStatus === "verified_elite" ||
    venue.badgeStatus === "managed_vip" ||
    venue.badgeStatus === "enterprise" ||
    isVipListing(venue);
  const ultimate =
    tier === "enterprise" || venue.badgeStatus === "enterprise";
  const vipChrome = isPremium
    ? "rounded-[22px] border border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/40"
    : "rounded-[22px] border border-neutral-800/70 opacity-80 grayscale-[0.2]";
  const galleryImages =
    isPremium && gallery.length
      ? gallery
      : gallery.slice(0, Math.min(gallery.length, 4));
  // Day 1: hero + Rates cards share venue.pricing (synced via lib/data).
  const pricedVenue = withVenuePricing({
    ...venue,
    pricing: venue.pricing?.length ? venue.pricing : content.pricing,
  });
  const sharedPricing = resolveVenuePricing({
    pricing: pricedVenue.pricing || content.pricing,
    profile: content.profile,
  });
  const syncedRateLine = formatPricingRateLine(sharedPricing);
  const startingFrom = minimumCoursePrice(sharedPricing);
  const vipListing = isVipListing(venue) || isPremium;

  return (
    <article
      className={`venue-detail-page has-sticky-cta venue-template tier-${tier} ${vipChrome}`}
      data-template="canva-op"
      data-tier={tier}
      data-elite={isPremium ? "true" : "false"}
    >
      <Link href={withLocale(locale, "/")} className="text-link venue-back">
        <ArrowLeft className="h-4 w-4" />
        {t("backHome")}
      </Link>

      {isPremium ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
          <span className="inline-flex items-center rounded-md border border-rose-400/80 bg-rose-950/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
            {ultimate ? VIP_BADGE_ENTERPRISE : VIP_BADGE_ELITE}
          </span>
          <span className="text-xs font-medium text-rose-200/80">
            Paid VIP chrome · priority placement · direct booking open
          </span>
        </div>
      ) : (
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
          <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-950/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Basic · Free listing
          </span>
          <span className="text-xs text-neutral-600">
            Upgrade to Managed VIP Elite for neon placement and unlocked chat.
          </span>
        </div>
      )}

      {/* Slot: Clean dark-luxury hero — no stock lingerie banners */}
      <VenueHeroBanner
        name={name}
        suburb={suburb}
        city={cityLabel(venue.city, locale)}
        category={categoryLabel(venue.category, locale)}
        address={venue.address}
        visibility={visibility}
        rateLine={syncedRateLine}
        saved={saved}
        saveLabel={t("save")}
        phoneHref={phoneHref}
        onToggleSave={() => {
          const nowSaved = toggleSaved(venue.id);
          showToast(nowSaved ? t("savedToast") : t("removedToast"));
        }}
      />
      {startingFrom ? (
        <p className="sr-only" data-pricing-min={startingFrom}>
          Minimum course rate {startingFrom}
        </p>
      ) : null}

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
        <VenueCoursePricing content={content} pricing={sharedPricing} />
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
        <VenueGallery
          images={galleryImages}
          alt={name}
          staffPreview={liveConsumer.staff.map((member) => member.image)}
        />
        {!isPremium ? (
          <p className="template-upgrade-hint">
            Free listings use curated roster + lounge highlights. Upgrade to{" "}
            {VIP_PLAN_LABEL} for custom galleries and glowing VIP chrome.
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
          Staff profiles use masquerade-masked, body-pose editorials.
          Galleries use moody luxury lounge imagery — not club party plates.
          Always confirm availability by phone.
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
          <a
            href={phoneHref}
            className="min-h-11 touch-manipulation"
            onClick={() =>
              trackVenueContact({
                venue_id: venue.id,
                venue_name: venue.name,
                contact_type: "call",
              })
            }
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        ) : null}
      </div>

      <div data-slot="related" className="template-slot">
        <RelatedVenues venues={related} />
      </div>

      <div className="reddit-share-box flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="eyebrow">
            <RedditLogo size={16} />
            REDDIT
          </div>
          <h2>{t("joinReddit")}</h2>
          <p className="m-0 text-sm text-neutral-400">
            Share this listing for TikTok, Reels, and Reddit traffic — dark
            luxury preview included.
          </p>
        </div>
        <RedditShareButton title={name} />
      </div>

      {/* Day-5 sticky conversion bar — messaging unlocks on Managed VIP Elite+ */}
      <VenueStickyCtaBar
        phoneHref={phoneHref}
        whatsappHref={vipListing ? liveConsumer.whatsappHref : undefined}
        wechat={vipListing ? liveConsumer.wechat : undefined}
        isVip={vipListing}
        upgradeHref={withLocale(locale, "/partners#vip-upgrade")}
        venueId={venue.id}
        venueName={venue.name}
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
