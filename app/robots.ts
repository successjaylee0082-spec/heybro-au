import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: [
          "/api/",
          "/admin",
          "/en/admin",
          "/zh/admin",
          "/saved",
          "/en/saved",
          "/zh/saved",
          "/manage",
          "/en/manage",
          "/zh/manage",
        ],
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
