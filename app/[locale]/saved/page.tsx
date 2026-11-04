"use client";

import { HeyBroCard } from "@/components/HeyBroCard";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import { filterVenues } from "@/lib/feed";

export default function SavedPage() {
  const { t } = useCopy();
  const { savedIds } = useNavigation();
  const venues = filterVenues({ savedIds, savedOnly: true });

  return (
    <div className="saved-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{t("saved")}</div>
          <h1 style={{ fontSize: 32 }}>{t("saved")}</h1>
          <p>{t("resultsHint")}</p>
        </div>
      </div>
      {venues.length === 0 ? (
        <div className="empty-state">
          <h3>{t("emptyTitle")}</h3>
          <p>{t("emptyBody")}</p>
        </div>
      ) : (
        <div className="venue-list">
          {venues.map((venue) => (
            <HeyBroCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
