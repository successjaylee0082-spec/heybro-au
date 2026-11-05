import { redirect } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

/** Journal replaced by monetized B2B Partners hub. */
export default async function BlogIndexRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect("/en/partners");
  redirect(withLocale(locale, "/partners"));
}
