import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, withLocale } from "@/lib/i18n";

const articles: Record<
  string,
  {
    title: string;
    titleZh: string;
    body: string[];
    bodyZh: string[];
  }
> = {
  "best-nightlife-spots-in-sydney-cbd": {
    title: "Best Nightlife Spots in Sydney CBD",
    titleZh: "悉尼市中心夜生活精选",
    body: [
      "Sydney CBD mixes harbour-edge bars, laneway rooms and late entertainment precincts.",
      "Use official transport and visitor guidance when planning late trips, and treat demo venue cards in this preview as illustrations rather than live inventory.",
    ],
    bodyZh: [
      "悉尼市中心混合了海港酒吧、巷弄空间与夜间娱乐区。",
      "规划夜间行程时请参考官方交通与访客指引；本预览中的场所卡片仅为示意，不是实时库存。",
    ],
  },
  "safe-guide-to-melbourne-adult-venues": {
    title: "Safe Guide to Melbourne Adult Venues",
    titleZh: "墨尔本成人场所安全指南",
    body: [
      "Melbourne nightlife is easiest when you plan transport home before you go out.",
      "This guide covers ordinary entertainment and personal safety references. It does not arrange sexual services or invent first-hand venue reviews.",
    ],
    bodyZh: [
      "出行前先规划返程交通，墨尔本夜生活会更轻松。",
      "本指南覆盖一般娱乐与人身安全参考，不安排性服务，也不编造第一手场所点评。",
    ],
  },
};

export function generateStaticParams() {
  return ["en", "zh"].flatMap((locale) =>
    Object.keys(articles).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = articles[slug];
  if (!article || !isLocale(locale)) return { robots: { index: false } };
  return {
    title: locale === "zh" ? article.titleZh : article.title,
    robots: { index: false, follow: true },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = articles[slug];
  if (!article) notFound();
  const paragraphs = locale === "zh" ? article.bodyZh : article.body;

  return (
    <article className="blog-page">
      <Link href={withLocale(locale, "/blog")} className="text-link">
        {locale === "zh" ? "返回专栏" : "Back to journal"}
      </Link>
      <h1 style={{ fontSize: 34, margin: "18px 0" }}>
        {locale === "zh" ? article.titleZh : article.title}
      </h1>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="detail-body" style={{ marginBottom: 14 }}>
          {paragraph}
        </p>
      ))}
    </article>
  );
}
