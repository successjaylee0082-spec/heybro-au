"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/geo";

export function useUserLocation(enabled = true) {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      setReady(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setReady(true);
      },
      () => {
        setOrigin(null);
        setReady(true);
      },
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 120_000 },
    );
  }, [enabled]);

  return { origin, ready };
}
