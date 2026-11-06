"use client";

import { BadgeCheck, Crown, Gem } from "lucide-react";
import type { ManagedBadgeVariant } from "@/lib/venue-highlights";
import {
  ENTERPRISE_MONTHLY_PRICE,
  VIP_BADGE_ELITE,
  VIP_BADGE_ENTERPRISE,
  VIP_BADGE_MANAGED,
  VIP_MONTHLY_PRICE,
} from "@/lib/listing-tier";

export function ManagedBadge({
  variant = "pro",
  size = "md",
  showPlan = false,
  enterprise = false,
}: {
  variant?: ManagedBadgeVariant;
  size?: "sm" | "md";
  showPlan?: boolean;
  /** When true, render Enterprise Ultimate chrome. */
  enterprise?: boolean;
}) {
  const isEnterprise = enterprise;
  const isVip = !isEnterprise && variant === "vip";
  return (
    <span
      className={
        isEnterprise
          ? `managed-badge managed-badge-vip managed-badge-${size}`
          : isVip
            ? `managed-badge managed-badge-vip managed-badge-${size}`
            : `managed-badge managed-badge-pro managed-badge-${size}`
      }
    >
      {isEnterprise ? (
        <Gem className="h-3 w-3" aria-hidden />
      ) : isVip ? (
        <Crown className="h-3 w-3" aria-hidden />
      ) : (
        <BadgeCheck className="h-3 w-3" aria-hidden />
      )}
      {isEnterprise
        ? VIP_BADGE_ENTERPRISE
        : isVip
          ? VIP_BADGE_ELITE
          : VIP_BADGE_MANAGED}
      {showPlan ? (
        <em className="managed-badge-plan">
          {isEnterprise ? ENTERPRISE_MONTHLY_PRICE : VIP_MONTHLY_PRICE}
        </em>
      ) : null}
    </span>
  );
}
