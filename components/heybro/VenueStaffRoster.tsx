"use client";

import Image from "next/image";
import type { StaffRosterMember } from "@/lib/venue-consumer";

function statusLabel(status: StaffRosterMember["status"]) {
  if (status === "active") return "Active Now";
  if (status === "soon") return "Soon";
  return "Off";
}

export function VenueStaffRoster({
  staff,
  activeCount,
}: {
  staff: StaffRosterMember[];
  activeCount: number;
}) {
  if (!staff.length) return null;

  return (
    <section className="staff-roster luxury-staff">
      <div className="staff-roster-head">
        <div>
          <div className="venue-section-label">Tonight&apos;s Agency Lineup</div>
          <h2>Premium staff portfolio</h2>
          <p>
            High-clarity profiles with stage name, stats and style tags —
            scan who&apos;s on before you book.
          </p>
        </div>
        <div className="staff-roster-count">
          Live roster
          <strong>{activeCount} Active</strong>
        </div>
      </div>
      <div className="staff-roster-grid">
        {staff.map((member) => (
          <article
            key={member.id}
            className={
              member.status === "active"
                ? "staff-card portfolio-card is-active"
                : "staff-card portfolio-card"
            }
          >
            <div className="staff-card-media">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover staff-portrait"
                sizes="(max-width: 820px) 50vw, 220px"
              />
              <div className="staff-media-shade" aria-hidden />
              <span className={`staff-status status-${member.status}`}>
                {member.status === "active" ? (
                  <i className="status-live-dot" aria-hidden />
                ) : null}
                {statusLabel(member.status)}
              </span>
              <div className="staff-overlay">
                <div className="staff-overlay-name">
                  <h3>{member.name}</h3>
                  {member.nameZh ? <em>{member.nameZh}</em> : null}
                </div>
                <div className="staff-overlay-badges">
                  <span className="stat-pill">{member.age} yrs</span>
                  <span className="stat-pill">{member.heightCm}cm</span>
                  <span className="stat-pill">{member.cup} cup</span>
                  <span className="stat-pill ethnicity">{member.ethnicity}</span>
                </div>
                <div className="staff-style-row">
                  {member.styles.map((style) => (
                    <span key={style}>{style}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
