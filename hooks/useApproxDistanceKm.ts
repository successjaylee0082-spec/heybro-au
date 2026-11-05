"use client";

import { useEffect, useState } from "react";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useApproxDistanceKm(lat?: number, lng?: number) {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      return;
    }

    const watch = navigator.geolocation.getCurrentPosition(
      (position) => {
        setDistanceKm(
          haversineKm(
            position.coords.latitude,
            position.coords.longitude,
            lat,
            lng,
          ),
        );
      },
      () => setDistanceKm(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60_000 },
    );

    return () => {
      // getCurrentPosition has no cancel token; noop cleanup
      void watch;
    };
  }, [lat, lng]);

  return distanceKm;
}
