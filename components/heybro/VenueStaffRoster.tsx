"use client";

import Image from "next/image";
import type { StaffRosterMember } from "@/lib/venue-consumer";

function statusLabel(status: StaffRosterMember["status"]) {
  if (status === "active") return "On shift · 出勤中";
  if (status === "soon") return "Soon · 即将";
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
          <div className="venue-section-label">Active Staff · 今日出勤</div>
          <h2>Tonight&apos;s lineup</h2>
          <p>
            Realistic profile cards with stage name, stats and style tags —
            scan who&apos;s on before you call.
          </p>
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
              member.status === "active" ? "staff-card is-active" : "staff-card"
            }
          >
            <div className="staff-card-media">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 820px) 50vw, 200px"
              />
              <span className={`staff-status status-${member.status}`}>
                {statusLabel(member.status)}
              </span>
            </div>
            <div className="staff-card-body">
              <div className="staff-card-name">
                <div>
                  <h3>{member.name}</h3>
                  {member.nameZh ? (
                    <div className="staff-name-zh">{member.nameZh}</div>
                  ) : null}
                </div>
                <span className="staff-age">{member.age}</span>
              </div>
              <div className="staff-stats">
                <span>{member.ethnicity}</span>
                <span>{member.heightCm}cm</span>
                <span>{member.cup} cup</span>
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
