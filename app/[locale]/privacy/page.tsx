import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { isLocale } from "@/lib/i18n";
import { SITE_HOST, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for HeyBro Directory — minimal data collection and PIN-authenticated venue tools.",
  robots: { index: true, follow: true },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <LegalDocument
      locale={locale}
      title="Privacy Policy"
      updated="14 November 2026"
    >
      <p>
        This Privacy Policy explains how HeyBro Directory ({SITE_HOST}) handles
        information when you browse the public directory or use
        PIN-authenticated venue manager tools.
      </p>

      <h2 className="text-xl text-neutral-100">1. Minimal Collection Model</h2>
      <p>
        HeyBro is designed as a largely non-member directory. Casual visitors
        are not required to create an account. We aim to collect only what is
        reasonably necessary to operate the Service, respond to compliance
        requests, and secure venue-manager access.
      </p>

      <h2 className="text-xl text-neutral-100">2. Information We May Process</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-neutral-100">Device / browser storage:</strong>{" "}
          an 18+ age verification flag (`age_verified_18`) stored locally in
          your browser so we do not re-prompt on every visit;
        </li>
        <li>
          <strong className="text-neutral-100">Technical logs:</strong> standard
          server and security logs (for example IP address, user agent, and
          request path) that may be processed by our hosting providers;
        </li>
        <li>
          <strong className="text-neutral-100">Venue manager inputs:</strong>{" "}
          listing content, roster details, and optional contact materials that
          advertisers upload after PIN authentication;
        </li>
        <li>
          <strong className="text-neutral-100">Support messages:</strong>{" "}
          information you voluntarily send to {SUPPORT_EMAIL} for takedown or
          compliance requests.
        </li>
      </ul>

      <h2 className="text-xl text-neutral-100">3. PIN Authentication Security</h2>
      <p>
        Venue managers access roster and listing controls using a venue-specific
        PIN (with a separate platform master PIN reserved for administration).
        PIN verification cookies are httpOnly where set by the application and
        are intended only to maintain an authenticated manage session. You must
        keep PINs confidential and request rotation if compromise is suspected.
      </p>

      <h2 className="text-xl text-neutral-100">4. How We Use Information</h2>
      <p>
        We use information to operate and secure the directory, display
        advertiser-managed listings, enforce age-gating and abuse controls,
        respond to legal or takedown requests, and improve service reliability.
        We do not sell personal information.
      </p>

      <h2 className="text-xl text-neutral-100">5. Sharing</h2>
      <p>
        We may share limited technical data with infrastructure providers
        (hosting, analytics if enabled, email delivery) under contractual
        confidentiality. We may disclose information where required by law or to
        protect the rights, safety, and integrity of the Service and its users.
      </p>

      <h2 className="text-xl text-neutral-100">6. Retention</h2>
      <p>
        Local age-verification flags remain until you clear site data.
        Advertiser-managed content remains until the advertiser removes it or a
        valid takedown is actioned. Support correspondence is retained as needed
        for compliance and dispute handling.
      </p>

      <h2 className="text-xl text-neutral-100">7. Your Choices</h2>
      <p>
        You can clear local storage / cookies in your browser to reset age
        verification and manage-session state. Advertisers may update or remove
        their listings via authenticated manage tools. For access, correction,
        or deletion requests relating to personal information we hold, contact{" "}
        <a className="text-rose-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>

      <h2 className="text-xl text-neutral-100">8. Contact</h2>
      <p>
        Privacy and compliance inquiries:{" "}
        <a className="text-rose-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </LegalDocument>
  );
}
