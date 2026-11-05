"use client";

import { BadgeCheck, Crown } from "lucide-react";
import type { ManagedBadgeVariant } from "@/lib/venue-highlights";
import { VIP_PLAN_LABEL } from "@/lib/venue-template";

export function ManagedBadge({
  variant = "pro",
  size = "md",
  showPlan = false,
}: {
  variant?: ManagedBadgeVariant;
  size?: "sm" | "md";
  showPlan?: boolean;
}) {
  const isVip = variant === "vip";
  return (
    <span
      className={
        isVip
          ? `managed-badge managed-badge-vip managed-badge-${size}`
          : `managed-badge managed-badge-pro managed-badge-${size}`
      }
    >
      {isVip ? <Crown className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {isVip ? "VERIFIED VIP" : "PRO MANAGED"}
      {showPlan ? <em className="managed-badge-plan">{VIP_PLAN_LABEL}</em> : null}
    </span>
  );
}
