"use client";

import { useEffect, useState } from "react";
import {
  clearAgeAccepted,
  readAgeAccepted,
  writeAgeAccepted,
} from "@/utils/age-agreement";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";

export function AgeGateModal({
  onResolved,
}: {
  onResolved: (accepted: boolean) => void;
}) {
  const { t } = useCopy();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const accepted = readAgeAccepted();
    if (accepted) onResolved(true);
    setChecking(false);
  }, [onResolved]);

  if (checking) {
    return (
      <div className="age-gate" role="status" aria-live="polite">
        <div className="age-gate-panel">
          <p>Checking access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-panel">
        <p className="age-gate-brand">Hey Bro</p>
        <h2 id="age-gate-title">{t("confirmAge")}</h2>
        <p className="age-gate-note">{t("ageNote")}</p>
        <div className="age-gate-actions">
          <Button
            type="button"
            onClick={() => {
              writeAgeAccepted();
              onResolved(true);
            }}
          >
            {t("yes18")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearAgeAccepted();
              window.location.href = "https://www.google.com.au";
            }}
          >
            {t("exit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
