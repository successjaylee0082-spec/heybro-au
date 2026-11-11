import { HomeFeed } from "@/components/heybro/HomeFeed";
import {
  getSeedDirectoryVenues,
  MELBOURNE_VERIFIED_VENUES,
  sydneyVenues,
  venues,
} from "@/lib/data";

function safeCatalog() {
  try {
    const seeded = getSeedDirectoryVenues();
    if (Array.isArray(seeded) && seeded.length > 0) return seeded;
  } catch {
    // fall through
  }
  return [
    ...(Array.isArray(sydneyVenues) ? sydneyVenues : []),
    ...(Array.isArray(MELBOURNE_VERIFIED_VENUES)
      ? MELBOURNE_VERIFIED_VENUES
      : []),
    ...(Array.isArray(venues) ? venues : []),
  ];
}

/**
 * Root landing — directory first (city selector, categories, venues).
 * Reddit / community content is opt-in via HomeFeed's collapsible panel.
 */
export default function RootPage() {
  return (
    <main className="page-shell mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <HomeFeed venues={safeCatalog() || []} source="seed" />
    </main>
  );
}
