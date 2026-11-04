import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/api/", "/admin", "/en/admin", "/zh/admin", "/saved"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
