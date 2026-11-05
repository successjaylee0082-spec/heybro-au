"use client";

import {
  Flame,
  Heart,
  Sparkles,
  Timer,
  Waves,
} from "lucide-react";
import type { ParsedVenueContent, VenuePriceRow } from "@/lib/venue-content";
import type { ReactNode } from "react";

/** AU + CN consumer rate cards (AUD). */
const FALLBACK_COURSES: VenuePriceRow[] = [
  { label: "30 mins · 半小时", duration: "30 min", price: "$150" },
  { label: "40 mins · 40分钟", duration: "40 min", price: "$200" },
  { label: "60 mins · 一小时", duration: "60 min", price: "$250" },
];

const SERVICE_META: Array<{ key: string; label: string; icon: ReactNode }> = [
  { key: "gfe", label: "GFE", icon: <Heart className="h-3.5 w-3.5" /> },
  { key: "oral", label: "Oral", icon: <Sparkles className="h-3.5 w-3.5" /> },
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
  {
    key: "bdsm",
    label: "Light BDSM",
    icon: <Flame className="h-3.5 w-3.5" />,
  },
];

function normalizeCourse(row: VenuePriceRow): VenuePriceRow {
  const mins = Number.parseInt(row.duration, 10);
  const isHour = /hr|hour|60/i.test(row.duration) || mins === 60;
  if (isHour) {
    return { label: "60 mins · 一小时", duration: "60 min", price: row.price || "$250" };
  }
  if (mins === 40) {
    return { label: "40 mins · 40分钟", duration: "40 min", price: row.price || "$200" };
  }
  if (mins === 30 || mins === 20) {
    return {
      label: "30 mins · 半小时",
      duration: "30 min",
      price: mins === 20 ? "$150" : row.price || "$150",
    };
  }
  return row;
}

export function VenueCoursePricing({
  content,
}: {
  content: ParsedVenueContent;
}) {
  const courses = FALLBACK_COURSES.map(normalizeCourse);
  const serviceLabels = new Set(
    (content.services.length
      ? content.services
      : SERVICE_META.map((item) => item.label)
    ).map((item) => item.toLowerCase()),
  );

  const services = SERVICE_META.filter(
    (item) =>
      serviceLabels.has(item.label.toLowerCase()) ||
      [...serviceLabels].some((label) => label.includes(item.key)),
  );
  const visibleServices = services.length ? services : SERVICE_META;

  return (
    <section className="course-pricing luxury-pricing">
      <div className="venue-section-label">Rates · 价格表</div>
      <h2>Course & Pricing (AUD)</h2>
      <p>Neon-clear dual-language rate cards with core service icons.</p>
      <div className="course-pricing-grid">
        {courses.map((course, index) => (
          <article
            key={`${course.price}-${course.duration}`}
            className={index === 1 ? "course-card is-featured" : "course-card"}
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
              <em>AUD</em>
            </div>
            <div className="course-card-chips">
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
