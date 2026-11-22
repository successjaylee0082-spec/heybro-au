import type { MetadataRoute } from "next";
import { getSeedDirectoryVenues } from "@/lib/data";
import { pairsFromVenues } from "@/lib/local-seo-shared";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl();
  const paths = [
    "",
    "/partners",
    "/community",
    "/vip-pass",
    "/terms",
    "/privacy",
    "/report",
  ];

  const staticEntries = paths.flatMap((path) => {
    const en = `${origin}/en${path}`;
    const zh = `${origin}/zh${path}`;
    return [
      {
        url: en,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: path === "" ? 1 : 0.6,
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
        changeFrequency: "daily" as const,
        priority: path === "" ? 0.9 : 0.5,
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

  const catalog = getSeedDirectoryVenues();
  const suburbEntries = pairsFromVenues(catalog).map((pair) => ({
    url: `${origin}/${pair.city}/${pair.suburbSlug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const venueEntries = catalog
    .filter((venue) => !venue.fictional)
    .map((venue) => ({
      url: `${origin}/en/venue/${venue.id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [...staticEntries, ...suburbEntries, ...venueEntries];
}
