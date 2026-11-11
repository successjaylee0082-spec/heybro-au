"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Lock,
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
import { trackVenueContact } from "@/lib/analytics";
import { safeDisplayedAge } from "@/lib/companion-profile";
import { buildWhatsAppHref, resolveWeChatContact } from "@/lib/booking-links";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { resolveCardPoseCover } from "@/lib/directory-covers";
import { withLocale } from "@/lib/i18n";
import {
  isVipListing,
  resolveVenueListingTier,
  VIP_BADGE_ELITE,
  VIP_BADGE_ENTERPRISE,
  VIP_MONTHLY_PRICE,
} from "@/lib/listing-tier";
import { listingServiceChips } from "@/lib/venue-profiles";
import { buildMapsUrl } from "@/utils/googleMaps";
import type { Venue } from "@/types";

const TAG_PILL =
  "inline-flex items-center px-2.5 py-1 text-xs rounded-md bg-neutral-800/70 text-neutral-500 border border-neutral-800 whitespace-nowrap";
const TAG_PILL_HOT =
  "inline-flex items-center px-2.5 py-1 text-xs rounded-md bg-rose-950/60 text-rose-200 border border-rose-700/50 whitespace-nowrap";
const CTA_BASE =
  "inline-flex items-center justify-center gap-1.5 min-h-11 w-full sm:w-auto px-3 text-xs font-semibold rounded-md border border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700 touch-manipulation";
const CTA_ELITE =
  "inline-flex items-center justify-center gap-1.5 min-h-11 w-full sm:w-auto px-3 text-xs font-semibold rounded-md border border-rose-500/80 bg-rose-950/50 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:bg-rose-900/60 touch-manipulation";

/** Paid VIP / Ultimate tiers that earn neon rose chrome + VERIFIED ELITE. */
function isPaidVipTier(venue: Venue, tier: ReturnType<typeof resolveVenueListingTier>) {
  const badge = venue.badgeStatus;
  return (
    tier === "vip" ||
    tier === "enterprise" ||
    tier === "managed" ||
    badge === "verified_elite" ||
    badge === "managed_vip" ||
    badge === "enterprise"
  );
}

/**
 * Roster / directory card — Day 8 mobile next/image + Day 9–10 VIP contrast.
 * Tailwind-only differentiation (no globals / layout / tailwind config edits).
 */
export function VenueCard({ venue }: { venue: Venue }) {
  const { locale, t } = useCopy();
  const { isSaved, toggleSaved, showToast } = useNavigation();
  const saved = isSaved(venue.id);
  const name = venue.name;
  const description = venue.description;
  const suburb = venue.suburb;
  const tags = venue.tags;
  const detailHref = withLocale(locale, `/venue/${venue.id}`);
  const cover = resolveCardPoseCover(venue.id, venue.image);
  const tier = resolveVenueListingTier(venue);
  const elite = isPaidVipTier(venue, tier);
  const managed = isVipListing(venue) || elite;
  const ultimate = tier === "enterprise" || venue.badgeStatus === "enterprise";
  const safeLadies = Array.isArray(venue.ladies)
    ? venue.ladies.map((lady) => ({
        ...lady,
        age: Math.max(20, Number(lady.age) || 21, safeDisplayedAge(lady.age)),
      }))
    : [];
  const transit = buildMapsUrl({
    lat: venue.lat,
    lng: venue.lng,
    address: venue.address,
    mode: "transit",
  });
  const phoneDigits = venue.phone?.replace(/[^\d+]/g, "") || "";
  const whatsappHref = managed
    ? buildWhatsAppHref(
        venue.customHighlights?.whatsapp || venue.phone,
        `Hi, I found ${venue.name} on Hey Bro — are you available tonight?`,
      )
    : undefined;
  const wechat = managed
    ? resolveWeChatContact({
        wechatId: venue.customHighlights?.wechat || undefined,
        qrPath: venue.customHighlights?.wechat
          ? "/images/wechat-qr.png"
          : null,
      })
    : { configured: false as const };

  const chips = managed
    ? listingServiceChips(venue)
    : listingServiceChips(venue).slice(0, 3);
  const paymentTags = Array.from(
    new Set([
      ...chips,
      ...(managed ? tags.slice(0, 1) : []),
      ...(venue.profile?.payments || []).map((payment) =>
        payment
          .replace("WeChat Pay 微信", "WeChat")
          .replace("Alipay 支付宝", "Alipay")
          .replace("Cash OK", "Cash OK")
          .replace("Discreet Parking", "Parking"),
      ),
    ]),
  ).filter(Boolean);

  const articleClass = elite
    ? [
        "venue-card luxury-venue is-managed is-vip tier-vip relative overflow-hidden",
        "rounded-xl border border-rose-500/80 bg-neutral-950",
        "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
        "ring-1 ring-rose-400/50",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl",
        "before:shadow-[inset_0_0_30px_rgba(244,63,94,0.18)]",
      ].join(" ")
    : [
        "venue-card luxury-venue is-free tier-free relative overflow-hidden",
        "rounded-xl border border-neutral-800/70 bg-neutral-950/55",
        "opacity-75 grayscale-[0.35] shadow-none",
      ].join(" ");

  return (
    <article
      className={articleClass}
      data-cover="masked-pose"
      data-tier={tier}
      data-elite={elite ? "true" : "false"}
    >
      {/* Neon rose glow rim — paid VIP / Ultimate only */}
      {elite ? (
        <div
          className="pointer-events-none absolute -inset-px z-0 animate-pulse rounded-xl bg-gradient-to-br from-rose-400/55 via-rose-500/30 to-rose-600/45 opacity-90 blur-[1.5px]"
          aria-hidden
        />
      ) : null}

      <div className="venue-image-wrap relative z-[1] aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4]">
        <Link
          href={detailHref}
          className="venue-image-button absolute inset-0 block"
          aria-label={name}
        >
          <Image
            src={cover}
            alt={`${name} · ${suburb} companion listing`}
            fill
            quality={elite ? 85 : 70}
            priority={false}
            loading="lazy"
            decoding="async"
            className={
              elite
                ? "venue-image object-cover object-[center_18%] contrast-[1.05]"
                : "venue-image object-cover object-[center_18%] saturate-[0.55] contrast-[0.88] brightness-[0.82]"
            }
            sizes="(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 420px"
          />
        </Link>
        <div className="venue-media-shade" aria-hidden />

        {!elite ? (
          <span
            className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-neutral-950/25"
            aria-hidden
          >
            <span className="rotate-[-18deg] select-none text-[13px] font-black tracking-[0.35em] text-neutral-100/20">
              FREE LISTING
            </span>
          </span>
        ) : null}

        <div className="managed-badge-slot absolute left-3 top-3 z-[2] flex flex-row flex-wrap items-center gap-2">
          {elite ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/80 bg-rose-950/90 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
              aria-label={ultimate ? VIP_BADGE_ENTERPRISE : VIP_BADGE_ELITE}
            >
              <ManagedBadge variant="vip" size="sm" enterprise={ultimate} />
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-950/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Basic · $49/mo
            </span>
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
        {elite ? (
          <span className="venue-live-pill absolute bottom-3 left-3 z-[2] inline-flex items-center gap-1.5 rounded-full border border-rose-400/70 bg-rose-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
            <i
              className="status-live-dot inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]"
              aria-hidden
            />
            Active Now
          </span>
        ) : null}
      </div>

      <div className="venue-content relative z-[1] flex flex-col gap-2 p-4">
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
          <h3
            className={
              elite
                ? "m-0 bg-gradient-to-r from-rose-100 via-amber-100 to-rose-200 bg-clip-text text-transparent leading-snug"
                : "m-0 leading-snug text-neutral-500"
            }
          >
            {name}
          </h3>
        </Link>

        {safeLadies.length > 0 ? (
          <p
            className={
              elite
                ? "m-0 text-xs leading-relaxed text-rose-100/90"
                : "m-0 text-xs leading-relaxed text-neutral-600"
            }
            aria-label="Tonight's companions"
          >
            {safeLadies.map((lady) => lady.name).join(" · ")}
          </p>
        ) : null}

        <div
          className="listing-quick-badges mt-2 flex flex-wrap gap-2"
          aria-label="Payments and amenities"
        >
          {paymentTags.map((chip) => (
            <span
              key={chip}
              className={chip === "CBD" || elite ? TAG_PILL_HOT : TAG_PILL}
            >
              {chip}
            </span>
          ))}
        </div>

        <p
          className={
            elite
              ? "listing-snip m-0 text-sm text-neutral-300"
              : "listing-snip m-0 text-sm text-neutral-500"
          }
        >
          {description.length > (managed ? 110 : 72)
            ? `${description.slice(0, managed ? 107 : 69)}…`
            : description}
        </p>

        <div className="venue-actions listing-cta-row mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {managed && phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className={`${elite ? CTA_ELITE : CTA_BASE} listing-cta-call`}
              onClick={() =>
                trackVenueContact({
                  venue_id: venue.id,
                  venue_name: venue.name,
                  contact_type: "call",
                })
              }
            >
              <Phone className="h-3.5 w-3.5" />
              Call Now
            </a>
          ) : null}
          {managed && whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${elite ? CTA_ELITE : CTA_BASE} listing-cta-whatsapp`}
              onClick={() =>
                trackVenueContact({
                  venue_id: venue.id,
                  venue_name: venue.name,
                  contact_type: "whatsapp",
                })
              }
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Direct
            </a>
          ) : null}
          {managed ? (
            <WeChatQrDialog
              contact={wechat}
              triggerClassName={`${elite ? CTA_ELITE : CTA_BASE} listing-cta-wechat`}
              label="WeChat QR"
              onOpen={() =>
                trackVenueContact({
                  venue_id: venue.id,
                  venue_name: venue.name,
                  contact_type: "wechat",
                })
              }
            />
          ) : null}
          {!managed ? (
            <>
              <span
                className={`${CTA_BASE} cursor-not-allowed opacity-45`}
                aria-disabled="true"
                title={`Upgrade to Managed VIP Elite · ${VIP_MONTHLY_PRICE}`}
              >
                <Lock className="h-3.5 w-3.5" />
                WhatsApp
              </span>
              <span
                className={`${CTA_BASE} cursor-not-allowed opacity-45`}
                aria-disabled="true"
                title={`Upgrade to Managed VIP Elite · ${VIP_MONTHLY_PRICE}`}
              >
                <Lock className="h-3.5 w-3.5" />
                WeChat
              </span>
              <Link href={detailHref} className={`${CTA_BASE} listing-cta-view`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                View details
              </Link>
            </>
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

        {!managed ? (
          <p className="listing-upgrade-hint mb-0 mt-1 text-xs text-neutral-500">
            Direct chat unlocks on Managed VIP Elite · {VIP_MONTHLY_PRICE}
          </p>
        ) : elite ? (
          <p className="listing-upgrade-hint mb-0 mt-1 text-xs font-medium text-rose-300/80">
            Verified Elite · priority placement · direct booking open
          </p>
        ) : null}
      </div>
    </article>
  );
}

export { VenueCard as HeyBroCard };
