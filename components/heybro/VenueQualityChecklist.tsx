"use client";

import { Star } from "lucide-react";
import type { QualityScore } from "@/lib/venue-consumer";

function Stars({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <div className="quality-stars" aria-label={`${score} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < full || (half && index === full);
        return (
          <Star
            key={index}
            className={filled ? "h-3.5 w-3.5 is-filled" : "h-3.5 w-3.5"}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
      <strong>{score.toFixed(1)}</strong>
    </div>
  );
}

export function VenueQualityChecklist({ scores }: { scores: QualityScore[] }) {
  if (!scores.length) return null;
  return (
    <section className="quality-checklist">
      <div className="venue-section-label">Quality check</div>
      <h2>1-second venue scorecard</h2>
      <p>Cleanliness, rooms and privacy at a glance.</p>
      <div className="quality-grid">
        {scores.map((score) => (
          <div key={score.id} className="quality-item">
            <div className="quality-item-label">{score.label}</div>
            <Stars score={score.score} />
            <div className="quality-meter">
              <span style={{ width: `${(score.score / 5) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
