"use client";

import { StaffCard } from "@/components/staff-card";
import {
  forceSafeAge,
  sanitizeCompanionList,
} from "@/lib/companion-profile";
import type { StaffRosterMember } from "@/lib/venue-consumer";

export function VenueStaffRoster({
  staff,
  activeCount,
}: {
  staff: StaffRosterMember[];
  activeCount: number;
}) {
  if (!staff.length) return null;

  const safeStaff = sanitizeCompanionList(
    staff.map((member) => {
      const displayAge = Math.max(20, Number(member.age) || 21);
      return {
        ...member,
        age: forceSafeAge(displayAge),
      };
    }),
  );

  if (!safeStaff.length) return null;

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
        {safeStaff.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
