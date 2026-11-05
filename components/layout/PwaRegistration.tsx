"use client";

import { useEffect } from "react";

async function clearHeyBroCaches() {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter(
        (key) =>
          key.startsWith("heybro-") ||
          key.startsWith("heybro-shell-") ||
          key.includes("workbox"),
      )
      .map((key) => caches.delete(key)),
  );
}

/**
 * Unregisters every service worker and drops shell caches so browsers cannot
 * keep serving pre-Tailwind / "Checking access…" HTML after a rebuild.
 */
export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
        await clearHeyBroCaches();
      } catch {
        // ignore
      }

      if (cancelled || process.env.NODE_ENV !== "production") return;

      // Re-register the self-destructing worker once so any already-installed
      // older worker claims clients, clears caches, and unregisters itself.
      try {
        await navigator.serviceWorker.register("/sw.js?v=4");
      } catch {
        // Failure-tolerant registration
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
