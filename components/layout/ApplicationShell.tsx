"use client";

import { useCallback, useState, type ReactNode } from "react";
import { AgeGateModal } from "@/components/layout/AgeGateModal";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavigationProvider } from "@/components/layout/NavigationProvider";

export function ApplicationShell({
  children,
  publicIntro,
}: {
  children: ReactNode;
  publicIntro?: ReactNode;
}) {
  const [accepted, setAccepted] = useState(false);
  const onResolved = useCallback((value: boolean) => {
    setAccepted(value);
  }, []);

  return (
    <NavigationProvider>
      {!accepted ? <AgeGateModal onResolved={onResolved} /> : null}
      <div
        className={accepted ? "app-shell" : "app-shell is-gated"}
        aria-hidden={!accepted}
      >
        <Header />
        <main className="page-shell app-main">
          {!accepted && publicIntro ? (
            <div className="gated-public-intro">{publicIntro}</div>
          ) : null}
          {accepted ? children : <div className="gated-placeholder" />}
        </main>
        <Footer />
        <MobileNav />
      </div>
    </NavigationProvider>
  );
}
