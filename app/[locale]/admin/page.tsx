import Link from "next/link";
import { isLocale, withLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="admin-panel">
      <div className="venue-section-label">Admin</div>
      <h1>Operator console</h1>
      <p>Manage directory visibility widgets and PRO Managed profiles.</p>
      <div className="admin-actions" style={{ marginTop: 18 }}>
        <Link
          href={withLocale(locale, "/admin/highlights")}
          className="venue-primary-cta"
        >
          Visibility highlights
        </Link>
      </div>
    </div>
  );
}
