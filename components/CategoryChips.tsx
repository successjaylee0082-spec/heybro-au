"use client";

import {
  Footprints,
  MoonStar,
  ShoppingBag,
  Sparkles,
  Theater,
} from "lucide-react";
import { categories } from "@/lib/cities";
import { useCopy } from "@/components/i18n/LocaleProvider";
import { useNavigation } from "@/components/layout/NavigationProvider";
import type { CategoryId } from "@/types";

const icons: Record<CategoryId, typeof MoonStar> = {
  "strip-clubs": Theater,
  nightlife: MoonStar,
  massage: Footprints,
  wellness: Sparkles,
  retail: ShoppingBag,
};

export function CategoryChips() {
  const { locale } = useCopy();
  const { category, setCategory } = useNavigation();

  return (
    <div className="category-list" role="list">
      {categories.map((item) => {
        const Icon = icons[item.id];
        const active = category === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className={active ? "category-item active" : "category-item"}
            onClick={() => setCategory(active ? "all" : item.id)}
          >
            <Icon />
            <span>{locale === "zh" ? item.labelZh : item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
