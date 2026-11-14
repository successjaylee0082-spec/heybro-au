import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const paths = [
    "",
    "/partners",
    "/community",
    "/terms",
    "/privacy",
    "/report",
  ];

  return paths.flatMap((path) => {
    const en = `${origin}/en${path}`;
    const zh = `${origin}/zh${path}`;
    return [
      {
        url: en,
        lastModified: new Date(),
        alternates: {
          languages: {
            "en-AU": en,
            "zh-Hans": zh,
            "x-default": en,
          },
        },
      },
      {
        url: zh,
        lastModified: new Date(),
        alternates: {
          languages: {
            "en-AU": en,
            "zh-Hans": zh,
            "x-default": en,
          },
        },
      },
    ];
  });
}
