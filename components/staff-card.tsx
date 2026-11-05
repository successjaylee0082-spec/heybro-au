"use client";

import Image from "next/image";
import type { StaffRosterMember } from "@/lib/venue-consumer";

function statusLabel(status: StaffRosterMember["status"]) {
  if (status === "active") return "Active Now";
  if (status === "soon") return "Soon";
  return "Off";
}

/**
 * Staff roster card — masked / body-pose focused portraits only.
 * Elegant masquerade veil reinforces face discretion on every card.
 */
export function StaffCard({ member }: { member: StaffRosterMember }) {
  return (
    <article
      className={
        member.status === "active"
          ? "staff-card portfolio-card is-active"
          : "staff-card portfolio-card"
      }
    >
      <div className="staff-card-media">
        <Image
          src={member.image}
          alt={`${member.name} · masked ${member.ethnicity} profile`}
          fill
          quality={90}
          className="object-cover object-[center_22%] staff-portrait"
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"
        />
        {/* Soft face veil + body-forward vignette */}
        <div className="staff-face-veil" aria-hidden />
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
  );
}
