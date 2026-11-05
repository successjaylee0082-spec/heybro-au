"use client";

import type { ParsedVenueContent } from "@/lib/venue-content";

const FALLBACK_COURSES = [
  { label: "Quick", duration: "20 min", price: "$75" },
  { label: "Standard", duration: "30 min", price: "$100" },
  { label: "Full hour", duration: "60 min", price: "$150" },
];

export function VenueCoursePricing({
  content,
}: {
  content: ParsedVenueContent;
}) {
  const courses = content.pricing.length ? content.pricing : FALLBACK_COURSES;
  const serviceChips = content.services.slice(0, 8);

  return (
    <section className="course-pricing">
      <div className="venue-section-label">Course & Pricing</div>
      <h2>Pick a session</h2>
      <p>Mobile-first rate cards with included service chips underneath.</p>
      <div className="course-pricing-grid">
        {courses.map((course) => (
          <article key={`${course.price}-${course.duration}`} className="course-card">
            <div className="course-card-top">
              <span>{course.label}</span>
              <strong>{course.duration.replace("1 hr", "60 min")}</strong>
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
