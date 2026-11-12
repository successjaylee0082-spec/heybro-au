"use client";

import Image from "next/image";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  addCompanion,
  ensureCompanionsSeededAction,
  listCompanionsAction,
  logoutVenuePinAction,
  toggleActiveStatus,
  updateCompanion,
  verifyVenuePinAction,
  type RosterActionResult,
} from "@/app/actions/roster";
import { WhatsAppContactButton } from "@/components/heybro/WhatsAppContactButton";
import { Button } from "@/components/ui/button";
import type { CompanionRow } from "@/lib/companions";

type Props = {
  venueId: string;
  venueName: string;
  initiallyUnlocked: boolean;
  initialCompanions: CompanionRow[];
  /** Local seed portrait URLs ordered by slot_index. */
  slotImages: string[];
  supportWhatsAppHref?: string;
};

function blockedName(name: string): boolean {
  const key = name.trim().toLowerCase();
  return key === "chanel" || key === "sophie";
}

export function RosterManager({
  venueId,
  venueName,
  initiallyUnlocked,
  initialCompanions,
  slotImages,
  supportWhatsAppHref,
}: Props) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [pin, setPin] = useState("");
  const [companions, setCompanions] =
    useState<CompanionRow[]>(initialCompanions);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    return [...companions].sort((a, b) => {
      const aActive = a.is_active === false ? 1 : 0;
      const bActive = b.is_active === false ? 1 : 0;
      if (aActive !== bActive) return aActive - bActive;
      return Number(a.slot_index || 0) - Number(b.slot_index || 0);
    });
  }, [companions]);

  function flash(result: RosterActionResult) {
    if (result.ok) {
      setError(null);
      setToast(result.message || "Saved.");
      if (result.companions) setCompanions(result.companions);
    } else {
      setToast(null);
      setError(result.error);
    }
    window.setTimeout(() => {
      setToast(null);
      setError(null);
    }, 3200);
  }

  function imageForSlot(slotIndex: number | null | undefined): string {
    const slot = Number(slotIndex);
    if (Number.isFinite(slot) && slot >= 0 && slot < slotImages.length) {
      return slotImages[slot];
    }
    return slotImages[0] || "/images/staff/western/01.jpg";
  }

  function unlock() {
    startTransition(async () => {
      const result = await verifyVenuePinAction(venueId, pin);
      if (!result.ok) {
        flash(result);
        return;
      }
      setUnlocked(true);
      const seeded = await ensureCompanionsSeededAction(venueId);
      if (seeded.ok) {
        flash(seeded);
        if (seeded.companions) setCompanions(seeded.companions);
        return;
      }
      const listed = await listCompanionsAction(venueId);
      flash(listed.ok ? listed : result);
    });
  }

  function logout() {
    startTransition(async () => {
      const result = await logoutVenuePinAction(venueId);
      setUnlocked(false);
      setPin("");
      flash(result);
    });
  }

  if (!unlocked) {
    return (
      <section className="mx-auto w-full max-w-md px-4 py-10">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-300/80">
            Venue Owner Access
          </p>
          <h1
            className="mt-2 text-3xl text-neutral-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {venueName}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Enter the 4-digit venue PIN to manage tonight&apos;s live roster.
            Photos stay automatic — no uploads required.
          </p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
            PIN
            <input
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="mt-2 h-12 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 text-center text-2xl tracking-[0.4em] text-neutral-50 outline-none focus:border-rose-400"
              placeholder="••••"
              autoComplete="one-time-code"
            />
          </label>
          <Button
            className="mt-5 w-full"
            disabled={pending || pin.length !== 4}
            onClick={unlock}
          >
            {pending ? "Checking…" : "Unlock Roster"}
          </Button>
          {error ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/80">
            Live Roster Manager
          </p>
          <h1
            className="mt-1 text-3xl text-neutral-50"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {venueName}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Toggle who is working today. Edits publish to the public venue page
            immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportWhatsAppHref ? (
            <WhatsAppContactButton
              href={supportWhatsAppHref}
              label="Support / Chat with Admin via WhatsApp"
              variant="support"
              venueId={venueId}
              venueName={venueName}
            />
          ) : null}
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                flash(await addCompanion({ venueId, name: "Nova", age: 22 }));
              })
            }
          >
            + Add Staff
          </Button>
          <Button variant="ghost" disabled={pending} onClick={logout}>
            Lock
          </Button>
        </div>
      </header>

      {(toast || error) && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-rose-500/40 bg-rose-950/50 text-rose-100"
              : "border-emerald-500/40 bg-emerald-950/40 text-emerald-100"
          }`}
          role="status"
        >
          {error || toast}
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((row) => (
          <CompanionEditorCard
            key={`${row.id}-${row.is_active}-${row.name}-${row.age}-${row.updated_at || ""}`}
            venueId={venueId}
            row={row}
            image={imageForSlot(row.slot_index)}
            pending={pending}
            onResult={flash}
            startTransition={startTransition}
          />
        ))}
        {!sorted.length ? (
          <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 p-8 text-center text-neutral-400">
            No companions yet. Tap{" "}
            <strong className="text-neutral-200">+ Add Staff</strong> or unlock
            again to import the seed roster.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CompanionEditorCard({
  venueId,
  row,
  image,
  pending,
  onResult,
  startTransition,
}: {
  venueId: string;
  row: CompanionRow;
  image: string;
  pending: boolean;
  onResult: (result: RosterActionResult) => void;
  startTransition: (cb: () => void) => void;
}) {
  const [name, setName] = useState(String(row.name || ""));
  const [age, setAge] = useState(String(Math.max(20, Number(row.age) || 20)));
  const [nationality, setNationality] = useState(
    String(row.nationality || "European"),
  );
  const [cup, setCup] = useState(String(row.cup || "C"));
  const [height, setHeight] = useState(String(row.height || 165));
  const [tags, setTags] = useState(
    Array.isArray(row.tags) ? row.tags.join(", ") : "",
  );
  const active = row.is_active !== false;

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-emerald-500/40 bg-neutral-950/90 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
          : "border-neutral-800 bg-neutral-950/50 opacity-80"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-800">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover object-[center_22%]"
            sizes="96px"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Slot {Number(row.slot_index ?? 0)}
              </p>
              <h2 className="text-lg font-semibold text-neutral-50">
                {name || "—"}
              </h2>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-300">
                Working Today (ACTIVE NOW)
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    onResult(
                      await toggleActiveStatus(
                        String(row.id),
                        venueId,
                        !active,
                      ),
                    );
                  })
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  active ? "bg-emerald-500" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                    active ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="Name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
            <Field label="Age (20+)">
              <input
                type="number"
                min={20}
                max={45}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
            <Field label="Nationality">
              <input
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
            <Field label="Cup">
              <input
                value={cup}
                onChange={(event) => setCup(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                min={150}
                max={190}
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
            <Field label="Tags">
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="GFE, Elegant"
                className="mt-1 h-9 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 text-sm text-neutral-50 outline-none focus:border-rose-400"
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={pending || blockedName(name)}
              onClick={() =>
                startTransition(async () => {
                  if (blockedName(name)) {
                    onResult({
                      ok: false,
                      error:
                        "Chanel and Sophie are blocked. Choose another stage name.",
                    });
                    return;
                  }
                  onResult(
                    await updateCompanion({
                      id: String(row.id),
                      venueId,
                      name,
                      age: Math.max(20, Number(age) || 20),
                      nationality,
                      cup,
                      height: Number(height) || 165,
                      tags,
                    }),
                  );
                })
              }
            >
              Save
            </Button>
          </div>
          {blockedName(name) ? (
            <p className="text-xs text-rose-300">
              That stage name is blocked. Use Chloe, Bella, or another adult
              name.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
      {label}
      {children}
    </label>
  );
}
