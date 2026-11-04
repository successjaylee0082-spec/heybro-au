import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

const articles = [
  {
    slug: "best-nightlife-spots-in-sydney-cbd",
    title: "Best Nightlife Spots in Sydney CBD",
    titleZh: "悉尼市中心夜生活精选",
    summary:
      "A source-backed guide to non-explicit entertainment and late venues around Sydney CBD.",
  },
  {
    slug: "safe-guide-to-melbourne-adult-venues",
    title: "Safe Guide to Melbourne Adult Venues",
    titleZh: "墨尔本成人场所安全指南",
    summary:
      "Practical visitor, transport and personal-safety notes for Melbourne nightlife — not a ranking guarantee.",
  },
];

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="blog-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">HEY BRO JOURNAL</div>
          <h1 style={{ fontSize: 32 }}>
            {locale === "zh" ? "专栏" : "Journal"}
          </h1>
          <p>
            {locale === "zh"
              ? "基于公开来源的夜生活与安全指南。"
              : "Source-backed nightlife and safety guides."}
          </p>
        </div>
      </div>
      <div className="thread-list">
        {articles.map((article) => (
          <article key={article.slug} className="thread-card">
            <h3>{locale === "zh" ? article.titleZh : article.title}</h3>
            <p className="detail-body">{article.summary}</p>
            <Link
              href={withLocale(locale, `/blog/${article.slug}`)}
              className="text-link"
            >
              {locale === "zh" ? "阅读" : "Read"}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
