import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { isLocale } from "@/lib/i18n";
import { SITE_HOST, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for HeyBro Directory (heybro-au.com) — independent nightlife advertising platform.",
  robots: { index: true, follow: true },
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <LegalDocument
      locale={locale}
      title="Terms of Service"
      updated="14 November 2026"
    >
      <p>
        These Terms of Service (&quot;Terms&quot;) govern access to and use of
        the HeyBro Directory website at {SITE_HOST} (the &quot;Service&quot;),
        operated as an independent online directory and digital advertising
        platform. By accessing or using the Service, you agree to these Terms.
      </p>

      <h2 className="text-xl text-neutral-100">1. Nature of the Service</h2>
      <p>
        HeyBro operates strictly as an independent online directory and digital
        advertising platform. We do not own, operate, manage, or endorse any
        listed venues, agencies, or independent advertisers, and we do not act
        as a booking agent, broker, or intermediary for any offline services.
      </p>

      <h2 className="text-xl text-neutral-100">2. 18+ Age Requirement</h2>
      <p>
        The Service is intended only for individuals aged 18 years or older (or
        the age of majority in your jurisdiction). By entering the Service you
        confirm that you meet this requirement. We reserve the right to restrict
        access where age verification cannot be confirmed.
      </p>

      <h2 className="text-xl text-neutral-100">
        3. Advertiser / Venue Manager Responsibility
      </h2>
      <p>
        All listings, rosters, availability statements, contact details, and
        visual materials are uploaded and managed directly by third-party venue
        managers or advertisers via PIN-authenticated access. Each advertiser is
        solely responsible for:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Ensuring full compliance with applicable Australian federal and state
          laws, including Victoria and New South Wales regulations;
        </li>
        <li>
          The accuracy, lawfulness, and currency of all content they publish;
        </li>
        <li>
          Obtaining all licences, permits, and consents required for their
          business and for any imagery or personal information they upload;
        </li>
        <li>
          Ensuring that no underage, illegal, exploitative, or non-consensual
          material is submitted.
        </li>
      </ul>

      <h2 className="text-xl text-neutral-100">4. No Endorsement or Agency</h2>
      <p>
        Publication of a listing does not constitute endorsement, verification of
        legality, or a recommendation by HeyBro. Any offline interaction,
        payment, or arrangement is solely between you and the third-party
        advertiser.
      </p>

      <h2 className="text-xl text-neutral-100">5. User Conduct</h2>
      <p>
        You must not misuse the Service, attempt to circumvent security controls
        (including venue manager PIN authentication), scrape personal data, or
        publish unlawful content. We may suspend or remove access for breach of
        these Terms.
      </p>

      <h2 className="text-xl text-neutral-100">6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, HeyBro assumes no liability for
        the accuracy of user-generated or advertiser-supplied content, or for
        any offline interactions arising from use of the Service. Nothing in
        these Terms excludes rights that cannot be excluded under the Australian
        Consumer Law.
      </p>

      <h2 className="text-xl text-neutral-100">7. Takedown &amp; Contact</h2>
      <p>
        For takedown requests, copyright claims, or compliance inquiries,
        contact{" "}
        <a className="text-rose-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>{" "}
        or use our Report / Takedown page.
      </p>

      <h2 className="text-xl text-neutral-100">8. Changes</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Service after changes are posted constitutes acceptance of the updated
        Terms.
      </p>
    </LegalDocument>
  );
}
