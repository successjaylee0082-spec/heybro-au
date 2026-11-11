"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AgeGateModal } from "@/components/layout/AgeGateModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import { cn } from "@/lib/utils";
import {
  getAgeAcceptedSnapshot,
  subscribeAgeAccepted,
} from "@/utils/age-agreement";

/**
 * Age gate is deferred until after mount so SSR + first paint always show the
 * full styled shell (header / search / cards / footer). No "Checking access…"
 * placeholder — that caused blank unstyled HTML when CSS/SW lagged.
 */
export function ApplicationShell({
  children,
}: {
  children: ReactNode;
  publicIntro?: ReactNode;
}) {
  const [gateReady, setGateReady] = useState(false);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    setAccepted(getAgeAcceptedSnapshot());
    setGateReady(true);
    return subscribeAgeAccepted(() => {
      setAccepted(getAgeAcceptedSnapshot());
    });
  }, []);

  const showGate = gateReady && !accepted;

  return (
    <NavigationProvider>
      {showGate ? <AgeGateModal /> : null}
      <div
        className={cn("app-shell", showGate && "is-gated")}
        // Defer gate attrs until after mount so SSR/client markup matches.
        aria-hidden={showGate ? true : undefined}
        suppressHydrationWarning
      >
        <Header />
        <main className="page-shell app-main">{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </NavigationProvider>
  );
}
