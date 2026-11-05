import { redirect } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

/** Legacy journal articles redirect into the B2B cashflow hub. */
export default async function BlogArticleRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/en/partners");
  redirect(withLocale(locale, "/partners"));
}
