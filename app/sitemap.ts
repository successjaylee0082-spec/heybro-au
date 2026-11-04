import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) return [];
  return [
    {
      url: `${origin}/en`,
      lastModified: new Date(),
      alternates: {
        languages: {
          "en-AU": `${origin}/en`,
          "zh-Hans": `${origin}/zh`,
          "x-default": `${origin}/en`,
        },
      },
    },
    {
      url: `${origin}/zh`,
      lastModified: new Date(),
      alternates: {
        languages: {
          "en-AU": `${origin}/en`,
          "zh-Hans": `${origin}/zh`,
          "x-default": `${origin}/en`,
        },
      },
    },
  ];
}
