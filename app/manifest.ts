import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HeyBro Directory",
    short_name: "HeyBro",
    description:
      "Independent Aussie nightlife directory for Sydney & Melbourne — 18+ only.",
    start_url: "/en",
    id: SITE_ORIGIN,
    display: "standalone",
    background_color: "#060709",
    theme_color: "#060709",
    lang: "en-AU",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
