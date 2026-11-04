"use client";

import { useCallback, useEffect, useState } from "react";
import { feedVenues } from "@/lib/feed";

export const BOOKMARK_KEY = "heybro-saved";

function validIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(feedVenues.map((venue) => venue.id));
  return [
    ...new Set(
      raw.filter((id): id is string => typeof id === "string" && allowed.has(id)),
    ),
  ];
}

function readBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return validIds(JSON.parse(window.localStorage.getItem(BOOKMARK_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readBookmarks());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === BOOKMARK_KEY) setIds(readBookmarks());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    const cleaned = validIds(next);
    setIds(cleaned);
    try {
      window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(cleaned));
    } catch {
      // session-only fallback already held in state
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const exists = ids.includes(id);
      persist(exists ? ids.filter((item) => item !== id) : [...ids, id]);
      return !exists;
    },
    [ids, persist],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, ready, toggle, has, setIds: persist };
}
