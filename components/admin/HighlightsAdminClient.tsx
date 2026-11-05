"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CustomHighlights, VenueHighlightBadge } from "@/lib/venue-highlights";

type AdminVenue = {
  id: string;
  name: string;
  suburb: string;
  isManaged?: boolean;
  managedBadge?: "pro" | "vip";
  rawHighlights: CustomHighlights;
};

const EMPTY_BADGE: VenueHighlightBadge = {
  kind: "price",
  label: "",
  value: "",
  tone: "emerald",
};

export function HighlightsAdminClient({
  initialVenues,
  authenticated,
  adminConfigured,
}: {
  initialVenues: AdminVenue[];
  authenticated: boolean;
  adminConfigured: boolean;
}) {
  const [authed, setAuthed] = useState(authenticated);
  const [keyInput, setKeyInput] = useState("");
  const [venues, setVenues] = useState(initialVenues);
  const [slug, setSlug] = useState(initialVenues[0]?.id || "");
  const selected = useMemo(
    () => venues.find((venue) => venue.id === slug) || venues[0],
    [venues, slug],
  );
  const [isManaged, setIsManaged] = useState(Boolean(selected?.isManaged));
  const [managedBadge, setManagedBadge] = useState<"pro" | "vip">(
    selected?.rawHighlights.managedBadge || "pro",
  );
  const [badges, setBadges] = useState<VenueHighlightBadge[]>(
    selected?.rawHighlights.badges?.length
      ? selected.rawHighlights.badges
      : [{ ...EMPTY_BADGE, label: "From", value: "$75/20min" }],
  );
  const [promoTitle, setPromoTitle] = useState(
    selected?.rawHighlights.promo?.title || "",
  );
  const [promoBody, setPromoBody] = useState(
    selected?.rawHighlights.promo?.body || "",
  );
  const [promoCtaLabel, setPromoCtaLabel] = useState(
    selected?.rawHighlights.promo?.ctaLabel || "Call Now",
  );
  const [promoCtaHref, setPromoCtaHref] = useState(
    selected?.rawHighlights.promo?.ctaHref || "",
  );
  const [hookTitle, setHookTitle] = useState(
    selected?.rawHighlights.hook?.title || "",
  );
  const [hookSubtitle, setHookSubtitle] = useState(
    selected?.rawHighlights.hook?.subtitle || "",
  );
  const [tier, setTier] = useState<"free" | "managed" | "vip">(
    selected?.rawHighlights.tier ||
      (selected?.isManaged
        ? selected.rawHighlights.managedBadge === "vip"
          ? "vip"
          : "managed"
        : "free"),
  );
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  function loadVenue(nextSlug: string) {
    const venue = venues.find((item) => item.id === nextSlug);
    setSlug(nextSlug);
    if (!venue) return;
    setIsManaged(Boolean(venue.isManaged));
    setManagedBadge(venue.rawHighlights.managedBadge || "pro");
    setBadges(
      venue.rawHighlights.badges?.length
        ? venue.rawHighlights.badges
        : [{ ...EMPTY_BADGE }],
    );
    setPromoTitle(venue.rawHighlights.promo?.title || "");
    setPromoBody(venue.rawHighlights.promo?.body || "");
    setPromoCtaLabel(venue.rawHighlights.promo?.ctaLabel || "Call Now");
    setPromoCtaHref(venue.rawHighlights.promo?.ctaHref || "");
    setHookTitle(venue.rawHighlights.hook?.title || "");
    setHookSubtitle(venue.rawHighlights.hook?.subtitle || "");
    setTier(
      venue.rawHighlights.tier ||
        (venue.isManaged
          ? venue.rawHighlights.managedBadge === "vip"
            ? "vip"
            : "managed"
          : "free"),
    );
  }

  async function login() {
    setStatus("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyInput }),
    });
    if (!response.ok) {
      setStatus("Login failed. Check ADMIN_PANEL_KEY.");
      return;
    }
    setAuthed(true);
    setStatus("Signed in.");
    const list = await fetch("/api/admin/venues/highlights");
    if (list.ok) {
      const json = await list.json();
      setVenues(json.venues || []);
      if (json.venues?.[0]?.id) loadVenue(json.venues[0].id);
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setStatus("");
    const nextManaged = tier !== "free" ? true : isManaged;
    const customHighlights: CustomHighlights = {
      managedBadge: tier === "vip" ? "vip" : managedBadge,
      tier,
      badges: badges.filter((badge) => badge.label.trim()),
      hook: hookTitle.trim()
        ? {
            title: hookTitle.trim(),
            subtitle: hookSubtitle.trim() || undefined,
          }
        : null,
      promo: promoTitle.trim()
        ? {
            title: promoTitle.trim(),
            body: promoBody.trim() || undefined,
            ctaLabel: promoCtaLabel.trim() || undefined,
            ctaHref: promoCtaHref.trim() || undefined,
          }
        : null,
    };
    const response = await fetch("/api/admin/venues/highlights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: selected.id,
        isManaged: nextManaged,
        customHighlights,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setStatus(json.error || "Save failed");
      return;
    }
    const json = await response.json();
    setVenues((current) =>
      current.map((venue) =>
        venue.id === selected.id
          ? {
              ...venue,
              isManaged: json.venue.isManaged,
              managedBadge: json.venue.managedBadge,
              rawHighlights: json.rawHighlights,
            }
          : venue,
      ),
    );
    setStatus("Saved visibility settings.");
  }

  if (!adminConfigured) {
    return (
      <div className="admin-panel">
        <h1>Highlights admin</h1>
        <p>
          Set <code>ADMIN_PANEL_KEY</code> in <code>.env</code> to unlock the
          visibility editor.
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-panel">
        <h1>Highlights admin</h1>
        <p>Enter the operator key to edit PRO Managed visibility widgets.</p>
        <div className="admin-form-row">
          <input
            type="password"
            value={keyInput}
            onChange={(event) => setKeyInput(event.target.value)}
            placeholder="ADMIN_PANEL_KEY"
          />
          <Button type="button" onClick={login}>
            Sign in
          </Button>
        </div>
        {status ? <p className="admin-status">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="venue-section-label">Admin</div>
          <h1>Visibility highlights</h1>
          <p>
            Configure the Canva-style template hooks, neon badges, and $40/mo VIP
            tier chrome.
          </p>
        </div>
      </div>

      <label className="admin-field">
        <span>Venue</span>
        <select
          value={selected?.id || ""}
          onChange={(event) => loadVenue(event.target.value)}
        >
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.isManaged ? "★ " : ""}
              {venue.name} · {venue.suburb}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-grid">
        <label className="admin-field">
          <span>Listing tier</span>
          <select
            value={tier}
            onChange={(event) => {
              const next = event.target.value as "free" | "managed" | "vip";
              setTier(next);
              setIsManaged(next !== "free");
              if (next === "vip") setManagedBadge("vip");
              if (next === "managed") setManagedBadge("pro");
            }}
          >
            <option value="free">Free template</option>
            <option value="managed">PRO Managed ($40/mo)</option>
            <option value="vip">Verified VIP ($40/mo)</option>
          </select>
        </label>
        <label className="admin-field">
          <span>Managed badge</span>
          <select
            value={managedBadge}
            onChange={(event) =>
              setManagedBadge(event.target.value as "pro" | "vip")
            }
            disabled={tier === "free"}
          >
            <option value="pro">PRO MANAGED</option>
            <option value="vip">VERIFIED VIP</option>
          </select>
        </label>
      </div>

      <section className="admin-section">
        <h2>Hook headline box</h2>
        <label className="admin-field">
          <span>Hook title</span>
          <input
            value={hookTitle}
            onChange={(event) => setHookTitle(event.target.value)}
            placeholder="🔥 20s Korean Staff, Zero Inner-Disappointment, Special Course Available"
          />
        </label>
        <label className="admin-field">
          <span>Hook subtitle</span>
          <input
            value={hookSubtitle}
            onChange={(event) => setHookSubtitle(event.target.value)}
            placeholder="Tonight's VIP lineup · book before peak hours"
          />
        </label>
      </section>

      <section className="admin-section">
        <h2>Highlight badges</h2>
        {badges.map((badge, index) => (
          <div key={index} className="admin-badge-row">
            <select
              value={badge.kind}
              onChange={(event) => {
                const next = [...badges];
                next[index] = {
                  ...badge,
                  kind: event.target.value as VenueHighlightBadge["kind"],
                };
                setBadges(next);
              }}
            >
              <option value="price">price</option>
              <option value="event">event</option>
              <option value="service">service</option>
              <option value="promo">promo</option>
              <option value="custom">custom</option>
            </select>
            <input
              value={badge.label}
              placeholder="Label"
              onChange={(event) => {
                const next = [...badges];
                next[index] = { ...badge, label: event.target.value };
                setBadges(next);
              }}
            />
            <input
              value={badge.value || ""}
              placeholder="Value"
              onChange={(event) => {
                const next = [...badges];
                next[index] = { ...badge, value: event.target.value };
                setBadges(next);
              }}
            />
            <select
              value={badge.tone || "emerald"}
              onChange={(event) => {
                const next = [...badges];
                next[index] = {
                  ...badge,
                  tone: event.target.value as VenueHighlightBadge["tone"],
                };
                setBadges(next);
              }}
            >
              <option value="emerald">emerald</option>
              <option value="rose">rose</option>
              <option value="amber">amber</option>
              <option value="violet">violet</option>
            </select>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setBadges([...badges, { ...EMPTY_BADGE }])}
        >
          Add badge
        </Button>
      </section>

      <section className="admin-section">
        <h2>Promo banner</h2>
        <label className="admin-field">
          <span>Title</span>
          <input
            value={promoTitle}
            onChange={(event) => setPromoTitle(event.target.value)}
            placeholder="Tonight only · complimentary drink"
          />
        </label>
        <label className="admin-field">
          <span>Body</span>
          <textarea
            value={promoBody}
            onChange={(event) => setPromoBody(event.target.value)}
            rows={3}
          />
        </label>
        <div className="admin-grid">
          <label className="admin-field">
            <span>CTA label</span>
            <input
              value={promoCtaLabel}
              onChange={(event) => setPromoCtaLabel(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>CTA href</span>
            <input
              value={promoCtaHref}
              onChange={(event) => setPromoCtaHref(event.target.value)}
              placeholder="tel:+61290000000 or https://"
            />
          </label>
        </div>
      </section>

      <div className="admin-actions">
        <Button type="button" onClick={save} disabled={saving || !selected}>
          {saving ? "Saving…" : "Save visibility"}
        </Button>
        {selected ? (
          <a
            className="admin-preview-link"
            href={`/en/venue/${selected.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview detail
          </a>
        ) : null}
      </div>
      {status ? <p className="admin-status">{status}</p> : null}
    </div>
  );
}
