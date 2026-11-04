import Link from "next/link";
import { withLocale } from "@/lib/i18n";
import type { Locale } from "@/types";

export function BrandMark({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <Link href={withLocale(locale, "/")} className={compact ? "brand brand-small" : "brand"}>
      <span className="brand-mark" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="brand-word">
        Hey <span>Bro</span>
      </span>
    </Link>
  );
}
