"use client";

import Image from "next/image";
import type { StaffRosterMember } from "@/lib/venue-consumer";

function statusLabel(status: StaffRosterMember["status"]) {
  if (status === "active") return "On shift";
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
    <section className="staff-roster">
      <div className="staff-roster-head">
        <div>
          <div className="venue-section-label">Active Staff Roster</div>
          <h2>Today&apos;s lineup</h2>
          <p>Profile cards first — skip the wall of text and scan who&apos;s on.</p>
        </div>
        <div className="staff-roster-count">
          Today Active
          <strong>{activeCount} Ladies</strong>
        </div>
      </div>
      <div className="staff-roster-grid">
        {staff.map((member) => (
          <article
            key={member.id}
            className={
              member.status === "active"
                ? "staff-card is-active"
                : "staff-card"
            }
          >
            <div className="staff-card-media">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 820px) 50vw, 180px"
              />
              <span className={`staff-status status-${member.status}`}>
                {statusLabel(member.status)}
              </span>
            </div>
            <div className="staff-card-body">
              <div className="staff-card-name">
                <h3>{member.name}</h3>
                <span>{member.age}</span>
              </div>
              <div className="staff-style-row">
                {member.styles.map((style) => (
                  <span key={style}>{style}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
