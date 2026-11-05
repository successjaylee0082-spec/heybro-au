import {
  DEFAULT_VENUE_SORT,
  sortVenuesByMode,
  type LatLng,
  type RankedVenue,
  type VenueSortMode,
} from "@/lib/geo";
import type { CategoryId, CityId, Venue } from "@/types";

export const feedVenues: Venue[] = [
  {
    id: "harbour-glow-lounge",
    name: "Harbour Glow Lounge",
    nameZh: "海港微光酒廊",
    city: "sydney",
    suburb: "Circular Quay",
    suburbZh: "环形码头",
    category: "nightlife-events",
    description:
      "Fictional waterfront lounge with harbour views, late cocktails and a calm late-week crowd.",
    descriptionZh: "虚构的海港酒廊，适合晚间鸡尾酒与轻松周末氛围。",
    image: "/images/lounges/mood-01-velvet.jpg",
    tags: ["Cocktails", "Harbour", "Late"],
    tagsZh: ["鸡尾酒", "海港", "深夜"],
    phone: "0297019001",
    address: "1 Demo Quay, Sydney NSW 2000",
    lat: -33.861,
    lng: 151.211,
    isCbd: true,
    verified: true,
    fictional: true,
    hours: "Thu–Sat 6pm–2am",
  },
  {
    id: "surry-neon-room",
    name: "Surry Neon Room",
    nameZh: "萨里霓虹厅",
    city: "sydney",
    suburb: "Surry Hills",
    suburbZh: "萨里山",
    category: "nightlife-events",
    description:
      "Demo basement bar with neon corners, vinyl nights and small-plate service.",
    descriptionZh: "演示地下室酒吧，霓虹角落与黑胶夜晚。",
    image: "/images/lounges/mood-02-suite.jpg",
    tags: ["Vinyl", "Small plates"],
    tagsZh: ["黑胶", "小食"],
    phone: "0297019002",
    address: "88 Demo Crown St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    verified: true,
    fictional: true,
    hours: "Wed–Sun 5pm–1am",
  },
  {
    id: "cross-stage-club",
    name: "Cross Stage Club",
    nameZh: "十字舞台俱乐部",
    city: "sydney",
    suburb: "Kings Cross",
    suburbZh: "国王十字",
    category: "strip-clubs",
    description:
      "Illustrative late venue card for directory layout only. Not a real business listing.",
    descriptionZh: "仅用于目录布局的示意场所卡片，并非真实商家。",
    image: "/images/lounges/mood-03-cocktail.jpg",
    tags: ["Late", "Stage"],
    tagsZh: ["深夜", "舞台"],
    phone: "0297019003",
    address: "12 Demo Darlinghurst Rd, Potts Point NSW 2011",
    lat: -33.874,
    lng: 151.224,
    fictional: true,
    hours: "Fri–Sat 9pm–3am",
  },
  {
    id: "yarra-signal-bar",
    name: "Yarra Signal Bar",
    nameZh: "雅拉信号酒吧",
    city: "melbourne",
    suburb: "Southbank",
    suburbZh: "南岸",
    category: "nightlife-events",
    description:
      "Fictional riverside bar for Melbourne nightlife browsing demos.",
    descriptionZh: "虚构河畔酒吧，用于墨尔本夜生活浏览演示。",
    image: "/images/lounges/mood-01-velvet.jpg",
    tags: ["River", "Rooftop"],
    tagsZh: ["河畔", "屋顶"],
    phone: "0397019004",
    address: "40 Demo Southbank Blvd, Southbank VIC 3006",
    lat: -37.823,
    lng: 144.964,
    verified: true,
    fictional: true,
    hours: "Daily 4pm–12am",
  },
  {
    id: "st-kilda-calm-spa",
    name: "St Kilda Calm Spa",
    nameZh: "圣基尔达静心水疗",
    city: "melbourne",
    suburb: "St Kilda",
    suburbZh: "圣基尔达",
    category: "brothels",
    description:
      "Fictional licensed venue card for directory layout only. Not a real business listing.",
    descriptionZh: "仅用于目录布局的虚构持牌场所卡片，并非真实商家。",
    image: "/images/lounges/mood-01-velvet.jpg",
    tags: ["Licensed", "Demo"],
    tagsZh: ["持牌", "演示"],
    phone: "0397019005",
    address: "55 Demo Acland St, St Kilda VIC 3182",
    lat: -37.868,
    lng: 144.98,
    fictional: true,
    hours: "Mon–Sun 10am–8pm",
  },
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
    image: "/images/lounges/mood-03-cocktail.jpg",
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
    image: "/images/lounges/mood-02-suite.jpg",
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
    image: "/images/lounges/mood-01-velvet.jpg",
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
      "Fictional escorts & massage directory card for category layout preview only.",
    descriptionZh: "伴游与按摩分类布局预览用的虚构目录卡片。",
    image: "/images/lounges/mood-01-velvet.jpg",
    tags: ["Massage", "Demo"],
    tagsZh: ["按摩", "演示"],
    phone: "0897019009",
    address: "14 Demo Peel St, Adelaide SA 5000",
    lat: -34.928,
    lng: 138.6,
    isCbd: true,
    fictional: true,
    hours: "Tue–Sun 11am–7pm",
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
    if (options.city && options.city !== "all" && venue.city !== options.city) {
      return false;
    }
    if (
      options.category &&
      options.category !== "all" &&
      venue.category !== options.category
    ) {
      return false;
    }
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

  return sortVenuesByMode(
    filtered,
    options.sort || DEFAULT_VENUE_SORT,
    options.origin,
  );
}
