"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { categoryLabel, cityLabel } from "@/lib/cities";
import { withLocale } from "@/lib/i18n";
import type { Venue } from "@/types";

export function RelatedVenues({ venues }: { venues: Venue[] }) {
  const { locale } = useCopy();
  if (!venues.length) return null;

  return (
    <section className="related-venues">
      <div className="venue-section-label">Nearby picks</div>
      <h2>You May Also Like</h2>
      <p className="related-venues-hint">
        Similar Sydney venues with quick call and website actions.
      </p>
      <div className="related-venues-grid">
        {venues.map((venue) => {
          const name =
            locale === "zh" && venue.nameZh ? venue.nameZh : venue.name;
          const suburb =
            locale === "zh" && venue.suburbZh ? venue.suburbZh : venue.suburb;
          return (
            <article key={venue.id} className="related-venue-card">
              <Link
                href={withLocale(locale, `/venue/${venue.id}`)}
                className="related-venue-media"
                aria-label={name}
              >
                <Image
                  src={venue.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 820px) 100vw, 280px"
                />
              </Link>
              <div className="related-venue-body">
                <div className="related-venue-meta">
                  {categoryLabel(venue.category, locale)} · {suburb}
                </div>
                <Link
                  href={withLocale(locale, `/venue/${venue.id}`)}
                  className="related-venue-title"
                >
                  {name}
                </Link>
                <p>
                  {cityLabel(venue.city, locale)} · {venue.address}
                </p>
                <div className="related-venue-actions">
                  {venue.phone ? (
                    <a
                      href={`tel:${venue.phone.replace(/[^\d+]/g, "")}`}
                      className="related-cta related-cta-call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Now
                    </a>
                  ) : null}
                  {venue.website ? (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="related-cta related-cta-web"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Website
                    </a>
                  ) : (
                    <Link
                      href={withLocale(locale, `/venue/${venue.id}`)}
                      className="related-cta related-cta-web"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
