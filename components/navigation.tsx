"use client";

/**
 * Primary navigation — Explore / Community / Partners / VIP Pass / Saved.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  BriefcaseBusiness,
  Compass,
  MessagesSquare,
  Ticket,
} from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types";

export type NavItem = {
  id: "explore" | "community" | "partners" | "vip-pass" | "saved";
  href: string;
  label: string;
  icon: typeof Compass;
  match: (pathname: string | null) => boolean;
  badge?: string;
};

export function getPrimaryNavItems(
  locale: Locale,
  labels: {
    explore: string;
    community: string;
    partners: string;
    vipPass: string;
    saved: string;
  },
): NavItem[] {
  return [
    {
      id: "explore",
      href: withLocale(locale, "/"),
      label: labels.explore,
      icon: Compass,
      match: (pathname) =>
        pathname === withLocale(locale, "/") ||
        Boolean(
          pathname?.match(
            new RegExp(
              `^/${locale}/(sydney|melbourne|brisbane|perth|gold-coast|adelaide)`,
            ),
          ),
        ),
    },
    {
      id: "community",
      href: withLocale(locale, "/community"),
      label: labels.community,
      icon: MessagesSquare,
      match: (pathname) => Boolean(pathname?.includes("/community")),
    },
    {
      id: "partners",
      href: withLocale(locale, "/partners"),
      label: labels.partners,
      icon: BriefcaseBusiness,
      match: (pathname) =>
        Boolean(pathname?.includes("/partners") || pathname?.includes("/blog")),
    },
    {
      id: "vip-pass",
      href: withLocale(locale, "/vip-pass"),
      label: labels.vipPass,
      icon: Ticket,
      badge: "50% OFF",
      match: (pathname) => Boolean(pathname?.includes("/vip-pass")),
    },
    {
      id: "saved",
      href: withLocale(locale, "/saved"),
      label: labels.saved,
      icon: Bookmark,
      match: (pathname) => Boolean(pathname?.includes("/saved")),
    },
  ];
}

function VipPassBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={compact ? "nav-vip-badge nav-vip-badge-compact" : "nav-vip-badge"}
      aria-hidden
    >
      {compact ? null : <Ticket className="h-3 w-3" />}
      <span>{compact ? "50%" : "50% OFF"}</span>
    </span>
  );
}

export function PrimaryNav({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const { locale, t } = useCopy();
  const pathname = usePathname();
  const { savedIds } = useNavigation();
  const items = getPrimaryNavItems(locale, {
    explore: t("list"),
    community: t("community"),
    partners: t("partners"),
    vipPass: t("vipPass"),
    saved: t("saved"),
  });

  if (variant === "mobile") {
    return (
      <nav className="mobile-nav grid w-full grid-cols-5" aria-label="Mobile">
        {items.map((item) => {
          const Icon = item.id === "community" ? undefined : item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={
                active
                  ? item.id === "vip-pass"
                    ? "mobile-nav-item active mobile-nav-item-vip min-w-0 px-1 text-[10px]"
                    : "mobile-nav-item active min-w-0 px-1 text-[10px]"
                  : item.id === "vip-pass"
                    ? "mobile-nav-item mobile-nav-item-vip min-w-0 px-1 text-[10px]"
                    : "mobile-nav-item min-w-0 px-1 text-[10px]"
              }
            >
              {item.id === "community" ? (
                <RedditLogo size={16} />
              ) : Icon ? (
                <Icon
                  className={
                    item.id === "vip-pass"
                      ? "h-4 w-4 shrink-0 text-amber-400"
                      : "h-4 w-4 shrink-0"
                  }
                />
              ) : null}
              <span className="truncate">{item.label}</span>
              {item.id === "vip-pass" ? <VipPassBadge compact /> : null}
              {item.id === "saved" && savedIds.length > 0 ? (
                <em className="saved-count">{savedIds.length}</em>
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="desktop-nav" aria-label="Primary">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={
              active
                ? item.id === "vip-pass"
                  ? "nav-link active nav-link-vip"
                  : "nav-link active"
                : item.id === "vip-pass"
                  ? "nav-link nav-link-vip"
                  : "nav-link"
            }
          >
            {item.id === "community" ? <RedditLogo size={14} /> : null}
            {item.id === "partners" ? (
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            ) : null}
            {item.id === "vip-pass" ? (
              <Ticket className="h-3.5 w-3.5 text-amber-400" />
            ) : null}
            {item.label}
            {item.id === "vip-pass" ? <VipPassBadge /> : null}
            {item.id === "saved" && savedIds.length > 0 ? (
              <span className="saved-count">{savedIds.length}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
