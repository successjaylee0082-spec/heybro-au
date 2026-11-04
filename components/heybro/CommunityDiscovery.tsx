"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RedditLogo } from "@/components/RedditLogo";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { withLocale } from "@/lib/i18n";

export function CommunityDiscovery() {
  const { locale, t } = useCopy();

  return (
    <section className="community-discovery" aria-labelledby="community-discovery-title">
      <div className="community-discovery-copy">
        <div className="eyebrow">
          <RedditLogo size={16} />
          REDDIT
        </div>
        <h2 id="community-discovery-title">{t("communityTitle")}</h2>
        <p>{t("communityBody")}</p>
        <div className="community-tags">
          <span>{t("sydneyTag")}</span>
          <span>{t("melbourneTag")}</span>
        </div>
      </div>
      <Link
        href={withLocale(locale, "/community")}
        className="community-discovery-cta"
      >
        {t("communityCta")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
