"use client";

import {
  AirVent,
  DoorOpen,
  Droplets,
  ParkingCircle,
  ShowerHead,
  Sparkles,
  Tv,
  Waves,
} from "lucide-react";
import type { ParsedVenueContent } from "@/lib/venue-content";
import type { ReactNode } from "react";

function amenityIcon(label: string): ReactNode {
  const lower = label.toLowerCase();
  if (lower.includes("park")) return <ParkingCircle className="h-4 w-4" />;
  if (lower.includes("entrance") || lower.includes("door")) {
    return <DoorOpen className="h-4 w-4" />;
  }
  if (lower.includes("shower")) return <ShowerHead className="h-4 w-4" />;
  if (lower.includes("spa") || lower.includes("jacuzzi")) {
    return <Waves className="h-4 w-4" />;
  }
  if (lower.includes("air")) return <AirVent className="h-4 w-4" />;
  if (lower.includes("tv") || lower.includes("screen")) {
    return <Tv className="h-4 w-4" />;
  }
  if (lower.includes("essentials")) return <Droplets className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

export function VenueStructuredContent({
  content,
  variant = "full",
}: {
  content: ParsedVenueContent;
  variant?: "full" | "overview";
}) {
  const showExtras = variant === "full";
  return (
    <div className="venue-structured">
      <section className="venue-section">
        <div className="venue-section-label">Overview</div>
        <h2>About this venue</h2>
        <p>{content.overview}</p>
      </section>

      {showExtras && content.pricing.length > 0 ? (
        <section className="venue-section">
          <div className="venue-section-label">Pricing</div>
          <h2>Session rates</h2>
          <div className="venue-price-table">
            <div className="venue-price-head">
              <span>Package</span>
              <span>Duration</span>
              <span>From</span>
            </div>
            {content.pricing.map((row) => (
              <div key={`${row.price}-${row.duration}`} className="venue-price-row">
                <span>{row.label}</span>
                <span>{row.duration}</span>
                <strong>{row.price}</strong>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showExtras && content.services.length > 0 ? (
        <section className="venue-section">
          <div className="venue-section-label">Services Offered</div>
          <h2>What you can book</h2>
          <div className="venue-chip-row">
            {content.services.map((service) => (
              <span key={service} className="venue-service-chip">
                {service}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {content.amenities.length > 0 ? (
        <section className="venue-section">
          <div className="venue-section-label">Key Amenities & Features</div>
          <h2>Comfort & discretion</h2>
          <div className="venue-amenity-grid">
            {content.amenities.map((amenity) => (
              <div key={amenity} className="venue-amenity-item">
                <span className="venue-amenity-icon">{amenityIcon(amenity)}</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
