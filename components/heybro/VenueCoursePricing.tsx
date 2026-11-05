"use client";

import { Flame, Heart, Sparkles, Timer, Waves } from "lucide-react";
import type { ParsedVenueContent, VenuePriceRow } from "@/lib/venue-content";
import type { ReactNode } from "react";

/** Day-4 AUD rate ladder — mobile-first 2-column course cards. */
const FALLBACK_COURSES: VenuePriceRow[] = [
  { label: "30 mins · 半小时", duration: "30m", price: "$150" },
  { label: "45 mins · 45分钟", duration: "45m", price: "$200" },
  { label: "60 mins · 一小时", duration: "60m", price: "$250" },
];

const SERVICE_META: Array<{ key: string; label: string; icon: ReactNode }> = [
  { key: "oral", label: "Oral", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: "gfe", label: "GFE", icon: <Heart className="h-3.5 w-3.5" /> },
  {
    key: "kiss",
    label: "Passionate Kissing",
    icon: <Flame className="h-3.5 w-3.5" />,
  },
  {
    key: "b2b",
    label: "Body to Body",
    icon: <Waves className="h-3.5 w-3.5" />,
  },
];

function normalizeCourse(row: VenuePriceRow): VenuePriceRow {
  const mins = Number.parseInt(row.duration, 10);
  if (/hr|hour|60/i.test(row.duration) || mins === 60) {
    return { label: "60 mins · 一小时", duration: "60m", price: row.price || "$250" };
  }
  if (mins === 45 || mins === 40) {
    return { label: "45 mins · 45分钟", duration: "45m", price: row.price || "$200" };
  }
  if (mins === 30 || mins === 20) {
    return { label: "30 mins · 半小时", duration: "30m", price: "$150" };
  }
  return row;
}

export function VenueCoursePricing({
  content,
}: {
  content: ParsedVenueContent;
}) {
  const courses = FALLBACK_COURSES.map(normalizeCourse);
  // Always surface the Day-4 OP service chips under every rate card.
  const visibleServices = SERVICE_META;

  return (
    <section
      className="course-pricing luxury-pricing day4-pricing"
      data-slot="pricing"
      aria-label="Course and pricing"
    >
      <div className="venue-section-label">Course & Pricing · 코스 가격</div>
      <h2>Rates (AUD)</h2>
      <p>Clean 2-column rate cards — duration, neon AUD price, included services.</p>
      <div className="course-pricing-grid day4-pricing-grid">
        {courses.map((course, index) => (
          <article
            key={`${course.price}-${course.duration}`}
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
              {visibleServices.map((service) => (
                <span key={service.label} className="service-chip">
                  {service.icon}
                  {service.label}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
