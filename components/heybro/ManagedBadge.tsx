"use client";

import { BadgeCheck, Crown } from "lucide-react";
import type { ManagedBadgeVariant } from "@/lib/venue-highlights";
import {
  VIP_BADGE_ELITE,
  VIP_BADGE_MANAGED,
  VIP_MONTHLY_PRICE,
} from "@/lib/listing-tier";

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
      {isVip ? (
        <Crown className="h-3 w-3" aria-hidden />
      ) : (
        <BadgeCheck className="h-3 w-3" aria-hidden />
      )}
      {isVip ? VIP_BADGE_ELITE : VIP_BADGE_MANAGED}
      {showPlan ? (
        <em className="managed-badge-plan">{VIP_MONTHLY_PRICE}</em>
      ) : null}
    </span>
  );
}
