"use client";

import type { ParsedVenueContent, VenuePriceRow } from "@/lib/venue-content";

/** AU + CN consumer rate cards (AUD). */
const FALLBACK_COURSES: VenuePriceRow[] = [
  { label: "30 mins · 半小时", duration: "30 min", price: "$150" },
  { label: "40 mins · 40分钟", duration: "40 min", price: "$200" },
  { label: "60 mins · 一小时", duration: "60 min", price: "$250" },
];

const DEFAULT_SERVICE_CHIPS = [
  "GFE",
  "Oral",
  "Passionate Kissing",
  "Body to Body",
  "Light BDSM",
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
    // Map legacy 20-min scrapes upward to the AU consumer 30-min card.
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
  // Always present the AU/CN consumer rate ladder for conversion clarity.
  // Scraped minute prices remain available in overview copy when present.
  const courses = FALLBACK_COURSES.map(normalizeCourse);

  const serviceChips = (
    content.services.length ? content.services : DEFAULT_SERVICE_CHIPS
  )
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, 8);

  // Ensure core OP-style tags remain visible.
  for (const chip of DEFAULT_SERVICE_CHIPS) {
    if (
      serviceChips.length < 8 &&
      !serviceChips.some((item) => item.toLowerCase() === chip.toLowerCase())
    ) {
      serviceChips.push(chip);
    }
  }

  return (
    <section className="course-pricing">
      <div className="venue-section-label">Rates · 价格表</div>
      <h2>Course & Pricing (AUD)</h2>
      <p>Clear dual-language rate cards for Australian & Chinese guests.</p>
      <div className="course-pricing-grid">
        {courses.map((course) => (
          <article
            key={`${course.price}-${course.duration}`}
            className="course-card"
          >
            <div className="course-card-top">
              <span>{course.label}</span>
              <strong>{course.duration}</strong>
            </div>
            <div className="course-card-price">
              {course.price}
              <em>AUD</em>
            </div>
            <div className="course-card-chips">
              {serviceChips.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
