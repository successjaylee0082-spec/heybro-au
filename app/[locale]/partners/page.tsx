import { notFound } from "next/navigation";
import { B2BCashflowHub } from "@/components/partners/B2BCashflowHub";
import { isLocale } from "@/lib/i18n";

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="partners-page">
      <B2BCashflowHub locale={locale} />
    </div>
  );
}
