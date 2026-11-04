import type { CategoryMeta, CityMeta } from "@/types";

export const cities: CityMeta[] = [
  { id: "sydney", label: "Sydney", labelZh: "悉尼" },
  { id: "melbourne", label: "Melbourne", labelZh: "墨尔本" },
  { id: "brisbane", label: "Brisbane", labelZh: "布里斯班" },
  { id: "perth", label: "Perth", labelZh: "珀斯" },
  { id: "gold-coast", label: "Gold Coast", labelZh: "黄金海岸" },
  { id: "adelaide", label: "Adelaide", labelZh: "阿德莱德" },
];

export const categories: CategoryMeta[] = [
  { id: "strip-clubs", label: "Strip Clubs", labelZh: "脱衣舞俱乐部" },
  { id: "nightlife", label: "Nightlife", labelZh: "夜生活" },
  { id: "massage", label: "Massage", labelZh: "按摩" },
  { id: "wellness", label: "Wellness", labelZh: "健康护理" },
  { id: "retail", label: "Retail", labelZh: "零售" },
];

export function cityLabel(
  id: string,
  locale: "en" | "zh",
): string {
  const city = cities.find((item) => item.id === id);
  if (!city) return id;
  return locale === "zh" ? city.labelZh : city.label;
}

export function categoryLabel(
  id: string,
  locale: "en" | "zh",
): string {
  const category = categories.find((item) => item.id === id);
  if (!category) return id;
  return locale === "zh" ? category.labelZh : category.label;
}
