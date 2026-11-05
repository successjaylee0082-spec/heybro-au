"use client";

import { VenueList } from "@/components/VenueList";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { filterVenues } from "@/lib/feed";
import type { Venue } from "@/types";

export function SavedVenues({ venues }: { venues: Venue[] }) {
  const { t } = useCopy();
  const { savedIds, sort } = useNavigation();
  const saved = filterVenues({
    venues,
    savedIds,
    savedOnly: true,
    sort,
  });

  return (
    <div className="saved-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("saved")}</div>
          <h1 style={{ fontSize: 32 }}>{t("saved")}</h1>
          <p>{t("resultsHint")}</p>
        </div>
      </div>
      {saved.length === 0 ? (
        <div className="empty-state">
          <h3>{t("emptyTitle")}</h3>
          <p>{t("emptyBody")}</p>
        </div>
      ) : (
        <VenueList venues={saved} />
      )}
    </div>
  );
}
