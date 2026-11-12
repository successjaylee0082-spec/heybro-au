"use client";

import { WhatsAppIcon } from "@/components/heybro/WhatsAppIcon";
import { trackVenueContact } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label?: string;
  variant?: "header" | "floating" | "support" | "inline";
  venueId?: string;
  venueName?: string;
  className?: string;
};

/**
 * Dark-luxury WhatsApp CTA with clean brand icon + click-to-chat link.
 */
export function WhatsAppContactButton({
  href,
  label = "Contact via WhatsApp",
  variant = "header",
  venueId,
  venueName,
  className,
}: Props) {
  const onClick = () => {
    if (!venueId || !venueName) return;
    trackVenueContact({
      venue_id: venueId,
      venue_name: venueName,
      contact_type: "whatsapp",
    });
  };

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-label={label}
        className={cn(
          "fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/50 bg-[#128C7E] text-white shadow-[0_0_28px_rgba(18,140,126,0.45)] transition hover:scale-105 hover:bg-[#25D366] md:bottom-8",
          className,
        )}
      >
        <WhatsAppIcon size={26} />
      </a>
    );
  }

  const base =
    variant === "support"
      ? "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/70 hover:bg-emerald-900/60 sm:w-auto"
      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-[#128C7E] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(18,140,126,0.28)] transition hover:bg-[#25D366]";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(base, className)}
    >
      <WhatsAppIcon size={18} />
      <span>{label}</span>
    </a>
  );
}
