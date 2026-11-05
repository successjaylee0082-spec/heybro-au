"use client";

import type { ParsedVenueContent, VenuePriceRow } from "@/lib/venue-content";

const FALLBACK_COURSES: VenuePriceRow[] = [
  { label: "20분", duration: "20 min", price: "$75" },
  { label: "30분", duration: "30 min", price: "$100" },
  { label: "60분", duration: "60 min", price: "$150" },
];

function normalizeCourse(row: VenuePriceRow): VenuePriceRow {
  const mins = Number.parseInt(row.duration, 10);
  const isHour = /hr|hour|60/i.test(row.duration);
  if (isHour || mins === 60) {
    return { ...row, label: row.label || "60분", duration: "60 min" };
  }
  if (mins === 20) return { ...row, label: "20분", duration: "20 min" };
  if (mins === 30) return { ...row, label: "30분", duration: "30 min" };
  return row;
}

export function VenueCoursePricing({
  content,
}: {
  content: ParsedVenueContent;
}) {
  const courses = (content.pricing.length ? content.pricing : FALLBACK_COURSES).map(
    normalizeCourse,
  );
  const serviceChips = content.services.slice(0, 8);

  return (
    <section className="course-pricing">
      <div className="venue-section-label">Course & Pricing</div>
      <h2>코스 · 가격표</h2>
      <p>모바일 2열 카드로 20 / 30 / 60분 요금을 바로 비교하세요.</p>
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
            <div className="course-card-price">{course.price}</div>
            {serviceChips.length ? (
              <div className="course-card-chips">
                {serviceChips.map((service) => (
                  <span key={service}>{service}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
