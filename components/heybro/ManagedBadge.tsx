"use client";

import { BadgeCheck, Crown } from "lucide-react";
import type { ManagedBadgeVariant } from "@/lib/venue-highlights";

export function ManagedBadge({
  variant = "pro",
  size = "md",
}: {
  variant?: ManagedBadgeVariant;
  size?: "sm" | "md";
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
    </span>
  );
}
