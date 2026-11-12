"use client";

import { useMemo, useState } from "react";
import { StaffCard } from "@/components/staff-card";
import { forceSafeAge, sanitizeCompanionList } from "@/lib/companion-profile";
import type { StaffRosterMember } from "@/lib/venue-consumer";

export function VenueStaffRoster({
  staff,
  activeCount,
}: {
  staff: StaffRosterMember[];
  activeCount: number;
}) {
  const [workingOnly, setWorkingOnly] = useState(false);

  const safeStaff = useMemo(() => {
    const cleaned = sanitizeCompanionList(
      staff.map((member) => {
        const displayAge = Math.max(20, Number(member.age) || 20);
        return {
          ...member,
          age: forceSafeAge(displayAge),
        };
      }),
    );

    const sorted = [...cleaned].sort((a, b) => {
      const aActive = a.status === "active" ? 0 : 1;
      const bActive = b.status === "active" ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return a.name.localeCompare(b.name);
    });

    if (!workingOnly) return sorted;
    return sorted.filter((member) => member.status === "active");
  }, [staff, workingOnly]);

  if (!staff.length) return null;
  if (!safeStaff.length && workingOnly) {
    return (
      <section className="staff-roster luxury-staff">
        <RosterHead
          activeCount={activeCount}
          workingOnly={workingOnly}
          onToggleWorkingOnly={() => setWorkingOnly((value) => !value)}
        />
        <p className="mt-4 text-sm text-neutral-400">
          No companions are marked Working Today right now.
        </p>
      </section>
    );
  }
  if (!safeStaff.length) return null;

  return (
    <section className="staff-roster luxury-staff">
      <RosterHead
        activeCount={activeCount}
        workingOnly={workingOnly}
        onToggleWorkingOnly={() => setWorkingOnly((value) => !value)}
      />
      <div className="staff-roster-grid">
        {safeStaff.map((member) => (
          <StaffCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

function RosterHead({
  activeCount,
  workingOnly,
  onToggleWorkingOnly,
}: {
  activeCount: number;
  workingOnly: boolean;
  onToggleWorkingOnly: () => void;
}) {
  return (
    <div className="staff-roster-head">
      <div>
        <div className="venue-section-label">Tonight&apos;s Agency Lineup</div>
        <h2>Premium staff portfolio</h2>
        <p>
          Active companions appear first with a live badge. Off-duty profiles
          stay available by appointment.
        </p>
        <button
          type="button"
          onClick={onToggleWorkingOnly}
          className={`mt-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
            workingOnly
              ? "border-emerald-400/70 bg-emerald-950/60 text-emerald-100"
              : "border-neutral-700 bg-neutral-950/70 text-neutral-300"
          }`}
        >
          {workingOnly ? "Showing: Working Today" : "Filter: Working Today"}
        </button>
      </div>
      <div className="staff-roster-count">
        Live roster
        <strong>{activeCount} Active</strong>
      </div>
    </div>
  );
}
