"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { CategoryId, CityId } from "@/types";

type NavigationContextValue = {
  city: CityId;
  setCity: (city: CityId) => void;
  category: CategoryId | "all";
  setCategory: (category: CategoryId | "all") => void;
  query: string;
  setQuery: (query: string) => void;
  savedIds: string[];
  bookmarksReady: boolean;
  toggleSaved: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  toast: string | null;
  showToast: (message: string) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState<CityId>("sydney");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const bookmarks = useBookmarks();

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      city,
      setCity,
      category,
      setCategory,
      query,
      setQuery,
      savedIds: bookmarks.ids,
      bookmarksReady: bookmarks.ready,
      toggleSaved: bookmarks.toggle,
      isSaved: bookmarks.has,
      toast,
      showToast,
    }),
    [bookmarks.has, bookmarks.ids, bookmarks.ready, bookmarks.toggle, category, city, query, showToast, toast],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}
