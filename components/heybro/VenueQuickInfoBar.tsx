"use client";

import {
  CreditCard,
  Languages,
  MapPinned,
  ShowerHead,
  Sparkles,
  Users,
} from "lucide-react";
import type { QuickInfoBadge } from "@/lib/venue-consumer";
import type { ReactNode } from "react";

function iconFor(kind: QuickInfoBadge["kind"]): ReactNode {
  if (kind === "location") return <MapPinned className="h-3.5 w-3.5" />;
  if (kind === "staff") return <Users className="h-3.5 w-3.5" />;
  if (kind === "payment") return <CreditCard className="h-3.5 w-3.5" />;
  if (kind === "facility") return <ShowerHead className="h-3.5 w-3.5" />;
  if (kind === "language") return <Languages className="h-3.5 w-3.5" />;
  return <Sparkles className="h-3.5 w-3.5" />;
}

export function VenueQuickInfoBar({ badges }: { badges: QuickInfoBadge[] }) {
  if (!badges.length) return null;
  return (
    <section className="quick-info-bar" aria-label="Quick venue info">
      <div className="quick-info-track">
        {badges.map((badge) => (
          <div key={badge.id} className={`quick-info-chip kind-${badge.kind}`}>
            <span className="quick-info-icon">{iconFor(badge.kind)}</span>
            <span className="quick-info-text">
              <strong>{badge.label}</strong>
              {badge.value ? <em>{badge.value}</em> : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
