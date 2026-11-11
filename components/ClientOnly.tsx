"use client";

import { useHasMounted } from "@/hooks/useHasMounted";
import type { ReactNode } from "react";

/**
 * Renders `fallback` until after hydration, then `children`.
 * Prevents Radix useId / portal attribute mismatches.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const mounted = useHasMounted();
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
