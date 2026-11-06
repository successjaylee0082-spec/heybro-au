"use client";

import { Flame, Heart, Sparkles, Timer, Waves, Flower2, Users } from "lucide-react";
import { resolveVenuePricing, type VenuePriceRow } from "@/lib/data";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { ReactNode } from "react";

const SERVICE_ICONS: Record<string, ReactNode> = {
  oral: <Sparkles className="h-3.5 w-3.5" />,
  gfe: <Heart className="h-3.5 w-3.5" />,
  "passionate kissing": <Flame className="h-3.5 w-3.5" />,
  kissing: <Flame className="h-3.5 w-3.5" />,
  "body to body": <Waves className="h-3.5 w-3.5" />,
  massage: <Flower2 className="h-3.5 w-3.5" />,
  nuru: <Waves className="h-3.5 w-3.5" />,
  greek: <Sparkles className="h-3.5 w-3.5" />,
  duo: <Users className="h-3.5 w-3.5" />,
};

function normalizeCourse(row: VenuePriceRow): VenuePriceRow {
  const mins = Number.parseInt(row.duration, 10);
  const price = row.price?.startsWith("$") ? row.price : row.price ? `$${row.price}` : "";
  if (!price) return { ...row, price: "" };
  if (/hr|hour|60/i.test(row.duration) || mins === 60) {
    return {
      label: row.label || "60 mins · 一小时",
      duration: "60m",
      price,
    };
  }
  if (mins === 45 || mins === 40) {
    return {
      label: row.label || "45 mins · 45分钟",
      duration: "45m",
      price,
    };
  }
  if (mins === 30 || mins === 20) {
    return {
      label: row.label || "30 mins · 半小时",
      duration: "30m",
      price,
    };
  }
  return { ...row, price };
}

export function VenueCoursePricing({
  content,
  pricing,
}: {
  content: ParsedVenueContent;
  /** Prefer venue.pricing — must match the hero rate line source. */
  pricing?: VenuePriceRow[] | null;
}) {
  // Single source of truth shared with the detail hero banner.
  const courses = resolveVenuePricing({
    pricing: pricing?.length ? pricing : content.pricing,
    profile: content.profile,
  })
    .map(normalizeCourse)
    .filter((course) => course.price)
    .slice(0, 3);
  const serviceLabels =
    content.profile?.services?.length
      ? content.profile.services
      : content.services.slice(0, 4);

  if (!courses.length) return null;

  return (
    <section
      className="course-pricing luxury-pricing day4-pricing"
      data-slot="pricing"
      aria-label="Course and pricing"
    >
      <div className="venue-section-label">Course & Pricing</div>
      <h2>Rates (AUD)</h2>
      <p>
        Tiered session rates for this venue — 30 / 45 / 60 minute courses in AUD.
        Confirm inclusions when you book.
      </p>
      <div className="course-pricing-grid day4-pricing-grid">
        {courses.map((course, index) => (
          <article
            key={`${course.price}-${course.duration}-${index}`}
            className={
              index === courses.length - 1
                ? "course-card is-featured day4-course-card"
                : "course-card day4-course-card"
            }
          >
            <div className="course-card-top">
              <span>
                <Timer className="h-3.5 w-3.5" />
                {course.label}
              </span>
              <strong>{course.duration}</strong>
            </div>
            <div className="course-card-price">
              <span className="neon-price">{course.price}</span>
              <em>/ {course.duration} AUD</em>
            </div>
            <div className="course-card-chips" aria-label="Included services">
              {serviceLabels.map((label) => (
                <span key={label} className="service-chip">
                  {SERVICE_ICONS[label.toLowerCase()] || (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {label}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      {content.payments?.length ? (
        <div className="course-payment-row" aria-label="Accepted payments">
          {content.payments.map((payment) => (
            <span key={payment} className="course-payment-chip">
              {payment}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
