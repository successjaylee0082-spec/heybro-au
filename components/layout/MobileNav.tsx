"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPinned, Bookmark, MessagesSquare } from "lucide-react";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { withLocale } from "@/lib/i18n";

export function MobileNav() {
  const { locale, t } = useCopy();
  const pathname = usePathname();
  const items = [
    { href: withLocale(locale, "/"), label: t("list"), icon: Compass },
    { href: withLocale(locale, "/#map"), label: t("map"), icon: MapPinned },
    {
      href: withLocale(locale, "/community"),
      label: t("community"),
      icon: MessagesSquare,
    },
    { href: withLocale(locale, "/saved"), label: t("saved"), icon: Bookmark },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href.endsWith("/saved") || item.href.includes("/community")
            ? pathname === item.href || pathname?.startsWith(item.href)
            : pathname === withLocale(locale, "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "mobile-nav-item active" : "mobile-nav-item"}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
