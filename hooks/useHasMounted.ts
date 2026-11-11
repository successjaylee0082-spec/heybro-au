"use client";

import { useEffect, useState } from "react";

/**
 * False on the server and during the first client render, then true.
 * Use to defer Radix / random-id widgets until after hydration.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
