"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AgeGateModal } from "@/components/layout/AgeGateModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import { cn } from "@/lib/utils";
import {
  getAgeAcceptedServerSnapshot,
  getAgeAcceptedSnapshot,
  subscribeAgeAccepted,
} from "@/utils/age-agreement";

export function ApplicationShell({
  children,
}: {
  children: ReactNode;
  /** @deprecated Kept for call-site compatibility; content stays in the live shell. */
  publicIntro?: ReactNode;
}) {
  const accepted = useSyncExternalStore(
    subscribeAgeAccepted,
    getAgeAcceptedSnapshot,
    getAgeAcceptedServerSnapshot,
  );

  return (
    <NavigationProvider>
      {!accepted ? <AgeGateModal /> : null}
      <div
        className={cn("app-shell", !accepted && "is-gated")}
        aria-hidden={!accepted}
        {...(!accepted ? { inert: true } : {})}
      >
        <Header />
        <main className="page-shell app-main">{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </NavigationProvider>
  );
}
