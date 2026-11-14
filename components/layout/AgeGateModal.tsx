"use client";

import {
  clearAgeAccepted,
  writeAgeAccepted,
} from "@/utils/age-agreement";
import { Button } from "@/components/ui/button";

/**
 * Full-screen 18+ age verification gate.
 * Shows when localStorage key `age_verified_18` is missing.
 */
export function AgeGateModal() {
  return (
    <div
      className="age-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="age-gate-panel">
        <p className="age-gate-brand">HeyBro · heybro-au.com</p>
        <h2 id="age-gate-title">18+ Adults Only / Age Verification</h2>
        <p className="age-gate-note">
          This website contains adult-oriented nightlife directory listings
          intended strictly for individuals aged 18 years or older (or the age
          of majority in your jurisdiction). By entering, you confirm that you
          are at least 18 years old and agree to our Terms of Service.
        </p>
        <div className="age-gate-actions">
          <Button
            type="button"
            className="age-gate-enter"
            onClick={() => {
              writeAgeAccepted();
            }}
          >
            I am 18 or older — Enter
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="age-gate-exit"
            onClick={() => {
              clearAgeAccepted();
              window.location.href = "https://www.google.com";
            }}
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
