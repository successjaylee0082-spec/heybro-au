import {
  STAFF_PORTRAIT_FALLBACKS,
  type StaffEthnicityLabel,
} from "@/lib/staff-image-map";

/**
 * Curated female-only portrait URLs for staff fallbacks.
 * Ethnicity matching is enforced via `portraitForEthnicity`.
 */
export { STAFF_PORTRAIT_FALLBACKS };

export type StaffProfileTemplate = {
  name: string;
  ethnicity: StaffEthnicityLabel;
  heightCm: number;
  cup: string;
  styles: string[];
};

/** Deterministic premium roster templates — official English attributes only. */
export const STAFF_PROFILE_TEMPLATES: StaffProfileTemplate[] = [
  {
    name: "Mei Lin",
    ethnicity: "Asian",
    heightCm: 165,
    cup: "C",
    styles: ["GFE", "Sensual", "Elegant"],
  },
  {
    name: "Sofia",
    ethnicity: "European",
    heightCm: 172,
    cup: "D",
    styles: ["GFE", "Slim", "Elegant"],
  },
  {
    name: "Hana",
    ethnicity: "Asian",
    heightCm: 160,
    cup: "B",
    styles: ["Sensual", "GFE", "Elegant"],
  },
  {
    name: "Aria",
    ethnicity: "Western",
    heightCm: 168,
    cup: "C",
    styles: ["GFE", "Playful", "Elegant"],
  },
  {
    name: "Nina",
    ethnicity: "Asian",
    heightCm: 166,
    cup: "C",
    styles: ["GFE", "Slim", "Sensual"],
  },
  {
    name: "Valentina",
    ethnicity: "Latina",
    heightCm: 170,
    cup: "D",
    styles: ["Sensual", "Glam", "Elegant"],
  },
  {
    name: "Chloe",
    ethnicity: "Western",
    heightCm: 174,
    cup: "C",
    styles: ["GFE", "Elegant", "Glam"],
  },
  {
    name: "Ling",
    ethnicity: "Asian",
    heightCm: 162,
    cup: "B",
    styles: ["GFE", "Sensual", "Elegant"],
  },
  {
    name: "Zara",
    ethnicity: "Western",
    heightCm: 171,
    cup: "DD",
    styles: ["Glam", "Elegant", "Sensual"],
  },
  {
    name: "Camila",
    ethnicity: "Latina",
    heightCm: 167,
    cup: "C",
    styles: ["Sensual", "GFE", "Elegant"],
  },
  {
    name: "Ivy",
    ethnicity: "Western",
    heightCm: 169,
    cup: "B",
    styles: ["Slim", "Playful", "GFE"],
  },
  {
    name: "Sora",
    ethnicity: "Asian",
    heightCm: 160,
    cup: "B",
    styles: ["GFE", "Sensual", "Elegant"],
  },
];
