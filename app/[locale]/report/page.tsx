import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { isLocale } from "@/lib/i18n";
import { SITE_HOST, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Report / Takedown",
  description:
    "Report illegal content, underage material, or rights infringements on HeyBro Directory.",
  robots: { index: true, follow: true },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <LegalDocument
      locale={locale}
      title="Report / Takedown"
      updated="14 November 2026"
    >
      <p>
        HeyBro Directory ({SITE_HOST}) maintains a zero-tolerance policy for
        illegal content and underage material. Use this page to report unlawful
        listings, copyright or privacy infringements, or other compliance
        concerns.
      </p>

      <h2 className="text-xl text-neutral-100">1. What You Can Report</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Suspected underage or exploitative material</li>
        <li>Illegal content under Australian federal or state law</li>
        <li>Copyright, trademark, or other intellectual-property claims</li>
        <li>Non-consensual imagery or privacy violations</li>
        <li>Impersonation, fraud, or grossly inaccurate advertiser claims</li>
      </ul>

      <h2 className="text-xl text-neutral-100">2. How to Submit a Request</h2>
      <p>
        Email{" "}
        <a className="text-rose-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>{" "}
        with the subject line <em>Takedown Request</em> or{" "}
        <em>Compliance Report</em>, and include:
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>The exact page URL or venue ID concerned</li>
        <li>A clear description of the issue</li>
        <li>
          Evidence or screenshots where available (do not redistribute illegal
          imagery)
        </li>
        <li>
          Your name, contact email, and—for rights claims—proof of authority to
          act
        </li>
        <li>The remedy you are requesting (removal, correction, etc.)</li>
      </ul>

      <h2 className="text-xl text-neutral-100">3. Our Process</h2>
      <p>
        We review actionable reports in good faith. Where a listing appears to
        violate law or these policies, we may remove or disable content, contact
        the advertiser, and/or escalate to relevant authorities. Because
        listings are managed by third-party venue operators, some matters may
        require advertiser cooperation; illegal or underage material will be
        prioritised for immediate action.
      </p>

      <h2 className="text-xl text-neutral-100">4. Emergency Harm</h2>
      <p>
        If someone is in immediate danger, contact local emergency services
        first. You may still notify us afterward so we can remove related
        material from the directory.
      </p>

      <h2 className="text-xl text-neutral-100">5. Good-Faith Reports</h2>
      <p>
        Submit only truthful information. Misuse of the report channel to harass
        competitors or suppress lawful speech may be disregarded.
      </p>

      <p className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-neutral-200">
        18+ Only | Zero Tolerance for Illegal Content or Underage Material.
        Contact:{" "}
        <a className="text-rose-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </LegalDocument>
  );
}
