"use client";

/**
 * Primary navigation model for Hey Bro — Explore / Community / B2B Partners / Saved.
 * Journal/blog is intentionally replaced by the monetized partners hub.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  BriefcaseBusiness,
  Compass,
  MessagesSquare,
} from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types";

export type NavItem = {
  id: "explore" | "community" | "partners" | "saved";
  href: string;
  label: string;
  icon: typeof Compass;
  match: (pathname: string | null) => boolean;
};

export function getPrimaryNavItems(locale: Locale, labels: {
  explore: string;
  community: string;
  partners: string;
  saved: string;
}): NavItem[] {
  return [
    {
      id: "explore",
      href: withLocale(locale, "/"),
      label: labels.explore,
      icon: Compass,
      match: (pathname) =>
        pathname === withLocale(locale, "/") ||
        Boolean(pathname?.match(new RegExp(`^/${locale}/(sydney|melbourne|brisbane|perth|gold-coast|adelaide)`))),
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
      id: "saved",
      href: withLocale(locale, "/saved"),
      label: labels.saved,
      icon: Bookmark,
      match: (pathname) => Boolean(pathname?.includes("/saved")),
    },
  ];
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
    saved: t("saved"),
  });

  if (variant === "mobile") {
    return (
      <nav className="mobile-nav" aria-label="Mobile">
        {items.map((item) => {
          const Icon = item.id === "community" ? undefined : item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={active ? "mobile-nav-item active" : "mobile-nav-item"}
            >
              {item.id === "community" ? (
                <RedditLogo size={16} />
              ) : Icon ? (
                <Icon className="h-4 w-4" />
              ) : null}
              <span>{item.label}</span>
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
            className={active ? "nav-link active" : "nav-link"}
          >
            {item.id === "community" ? <RedditLogo size={14} /> : null}
            {item.id === "partners" ? (
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            ) : null}
            {item.label}
            {item.id === "saved" && savedIds.length > 0 ? (
              <span className="saved-count">{savedIds.length}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
