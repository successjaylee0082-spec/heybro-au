import { attachPricingToVenues, venues as cityVenues } from "@/lib/data";
import { assignDirectoryPoseCovers } from "@/lib/directory-covers";
import {
  DEFAULT_VENUE_SORT,
  sortVenuesByMode,
  type LatLng,
  type RankedVenue,
  type VenueSortMode,
} from "@/lib/geo";
import type { CategoryId, CityId, Venue } from "@/types";

export const feedVenues: Venue[] = [
  // Sydney + Melbourne SSOT from lib/data.ts (sorting logic unchanged).
  ...(Array.isArray(cityVenues) ? cityVenues : []),
  {
    id: "fortitude-pulse",
    name: "Fortitude Pulse",
    nameZh: "福帝图德脉搏",
    city: "brisbane",
    suburb: "Fortitude Valley",
    suburbZh: "福帝图德谷",
    category: "nightlife-events",
    description:
      "Sample Valley nightcard for Brisbane city filtering and Maps actions.",
    descriptionZh: "布里斯班城市筛选与地图操作的示例卡片。",
    image: "/images/directory/06.jpg",
    tags: ["Valley", "Dance"],
    tagsZh: ["山谷", "舞池"],
    phone: "0797019006",
    address: "100 Demo Brunswick St, Fortitude Valley QLD 4006",
    lat: -27.457,
    lng: 153.034,
    verified: true,
    fictional: true,
    hours: "Thu–Sat 8pm–3am",
  },
  {
    id: "perth-ember-room",
    name: "Perth Ember Room",
    nameZh: "珀斯余烬厅",
    city: "perth",
    suburb: "Northbridge",
    suburbZh: "北桥",
    category: "nightlife-events",
    description: "Fictional Northbridge lounge for western-state city coverage.",
    descriptionZh: "虚构北桥酒廊，覆盖西部城市筛选。",
    image: "/images/directory/07.jpg",
    tags: ["Lounge", "Whisky"],
    tagsZh: ["酒廊", "威士忌"],
    phone: "0897019007",
    address: "22 Demo James St, Northbridge WA 6003",
    lat: -31.948,
    lng: 115.858,
    fictional: true,
    hours: "Wed–Sat 5pm–1am",
  },
  {
    id: "coast-tide-retail",
    name: "Coast Tide Supply",
    nameZh: "海岸潮汐商店",
    city: "gold-coast",
    suburb: "Surfers Paradise",
    suburbZh: "冲浪者天堂",
    category: "adult-retail",
    description:
      "Illustrative boutique card for adult retail browsing. Not a live storefront.",
    descriptionZh: "成人零售分类浏览的示意精品店卡片，并非真实门店。",
    image: "/images/directory/08.jpg",
    tags: ["Boutique", "Adult retail"],
    tagsZh: ["精品", "成人零售"],
    phone: "0797019008",
    address: "7 Demo Cavill Ave, Surfers Paradise QLD 4217",
    lat: -28.002,
    lng: 153.429,
    fictional: true,
    hours: "Daily 10am–6pm",
  },
  {
    id: "adelaide-laneway-massage",
    name: "Laneway Recovery Studio",
    nameZh: "巷弄恢复工作室",
    city: "adelaide",
    suburb: "Adelaide CBD",
    suburbZh: "阿德莱德市中心",
    category: "escorts-massage",
    description:
      "Fictional Adelaide CBD massage studio. Nuru & GFE packages $150/30 mins · $200/45 mins · $250/60 mins. WeChat Pay and Alipay welcome. Features Private Shower Discreet Parking Meet and Greet Room Essentials Provided.",
    descriptionZh: "虚构阿德莱德 CBD 按摩工作室。支持微信/支付宝，30/45/60 分钟套餐。",
    image: "/images/directory/09.jpg",
    tags: ["Massage", "WeChat", "Alipay", "Private Shower", "Discreet Parking"],
    tagsZh: ["按摩", "微信", "支付宝"],
    phone: "0897019009",
    address: "14 Demo Peel St, Adelaide SA 5000",
    lat: -34.928,
    lng: 138.6,
    isCbd: true,
    fictional: true,
    hours: "Tue–Sun 11am–late",
  },
];

export function getVenueById(id: string): Venue | undefined {
  return feedVenues.find((venue) => venue.id === id);
}

export function filterVenues(options: {
  venues?: Venue[];
  city?: CityId | "all";
  category?: CategoryId | "all";
  query?: string;
  savedIds?: string[];
  savedOnly?: boolean;
  sort?: VenueSortMode;
  /** Optional GPS origin — when set, non-CBD proximity uses user location. */
  origin?: LatLng | null;
}): RankedVenue[] {
  const list = options.venues ?? feedVenues;
  const query = options.query?.trim().toLowerCase() ?? "";
  const filtered = list.filter((venue) => {
    const selectedCity = options.city;
    const selectedCategory = options.category;
    const venueCity = String(venue.city || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const venueSlug = String(
      (venue as Venue & { citySlug?: string }).citySlug || "",
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const filterCity = String(selectedCity || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const matchesCity =
      !selectedCity ||
      filterCity === "all" ||
      venueCity === filterCity ||
      venueSlug === filterCity;
    if (!matchesCity) return false;

    const filterCategory = String(selectedCategory || "")
      .trim()
      .toLowerCase();
    const matchesCategory =
      !selectedCategory ||
      filterCategory === "all" ||
      String(venue.category || "")
        .trim()
        .toLowerCase() === filterCategory;
    if (!matchesCategory) return false;
    if (options.savedOnly && options.savedIds) {
      if (!options.savedIds.includes(venue.id)) return false;
    }
    if (!query) return true;
    const haystack = [
      venue.name,
      venue.nameZh,
      venue.suburb,
      venue.suburbZh,
      venue.description,
      venue.descriptionZh,
      ...venue.tags,
      ...(venue.tagsZh ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  const ranked = sortVenuesByMode(
    filtered,
    options.sort || DEFAULT_VENUE_SORT,
    options.origin,
  );
  // Attach shared pricing ladders, then unique masked pose covers for cards.
  return assignDirectoryPoseCovers(attachPricingToVenues(ranked));
}
