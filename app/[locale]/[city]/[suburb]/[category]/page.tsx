import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, withLocale } from "@/lib/i18n";

const previewPages = new Set([
  "sydney/surry-hills/massage",
  "melbourne/st-kilda/nightclub",
  "brisbane/fortitude-valley/escorts",
]);

export function generateStaticParams() {
  return ["en", "zh"].flatMap((locale) =>
    [...previewPages].map((path) => {
      const [city, suburb, category] = path.split("/");
      return { locale, city, suburb, category };
    }),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    city: string;
    suburb: string;
    category: string;
  }>;
}): Promise<Metadata> {
  const { city, suburb, category } = await params;
  const key = `${city}/${suburb}/${category}`;
  if (!previewPages.has(key)) return {};
  return {
    title: `${suburb.replace(/-/g, " ")} · ${city}`,
    robots: { index: false, follow: false },
  };
}

export default async function LocalLandingPage({
  params,
}: {
  params: Promise<{
    locale: string;
    city: string;
    suburb: string;
    category: string;
  }>;
}) {
  const { locale, city, suburb, category } = await params;
  if (!isLocale(locale)) notFound();
  const key = `${city}/${suburb}/${category}`;
  if (!previewPages.has(key)) notFound();

  const unavailable = category === "escorts";
  const title = `${suburb.replace(/-/g, " ")} / ${city.replace(/-/g, " ")}`;

  return (
    <div className="local-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">{category.toUpperCase()}</div>
          <h1 style={{ fontSize: 32, textTransform: "capitalize" }}>{title}</h1>
          <p>
            {unavailable
              ? locale === "zh"
                ? "该分类在本目录中不可用。此处不提供列表、联系或路线。"
                : "This category is unavailable in this directory. No listings, contacts or directions are provided."
              : locale === "zh"
                ? "这是空预览页。当前演示库存中没有匹配条目。"
                : "This is an empty preview page. The current demo inventory has no matching listings."}
          </p>
        </div>
      </div>
      <Link href={withLocale(locale, "/")} className="text-link">
        {locale === "zh" ? "返回首页" : "Back to home"}
      </Link>
    </div>
  );
}
