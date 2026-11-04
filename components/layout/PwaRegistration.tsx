"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: unregister any existing workers so stale CSS/HTML caches cannot
    // strip Tailwind after a rebuild or port-forward refresh.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        .catch(() => {
          // ignore
        });
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => {
            // ignore
          });
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Failure-tolerant registration
    });
  }, []);
  return null;
}
