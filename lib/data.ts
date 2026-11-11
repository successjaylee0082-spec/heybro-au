/**
 * Day 1 data facade — single source of truth helpers for pricing,
 * Melbourne CBD-first ranking hints, and masked staff portrait pools.
 */

import {
  formatPricingRateLine,
  parseVenueContent,
  resolveVenuePricing,
  syncContentPricing,
  type VenuePriceRow,
} from "@/lib/venue-content";
import {
  isTrustedStaffPortrait,
  portraitForEthnicity,
  STAFF_PORTRAIT_FALLBACKS,
} from "@/lib/staff-image-map";
import {
  buildVenueOperationalProfile,
  type VenueAmenityChip,
  type VenueOperationalProfile,
  type VenuePaymentChip,
} from "@/lib/venue-profiles";
import type {
  CategoryId,
  CityId,
  Venue,
  VenueBadgeStatus,
  VenueMessagingHandles,
} from "@/types";

export type { VenuePriceRow, VenueBadgeStatus, VenueMessagingHandles };
export {
  formatPricingRateLine,
  resolveVenuePricing,
  syncContentPricing,
  parseVenueContent,
};

/** English-only payment chips for Melbourne verified houses. */
const MELBOURNE_PAYMENTS: Array<
  VenuePaymentChip | "WeChat Pay" | "Alipay"
> = ["Cash OK", "EFTPOS", "WeChat Pay", "Alipay"];

const SEED_COORDS: Record<string, { lat: number; lng: number }> = {
  "melb-1": { lat: -37.8006, lng: 144.964 },
  "melb-2": { lat: -37.8195, lng: 144.9568 },
  "melb-3": { lat: -37.8325, lng: 144.9605 },
  "melb-4": { lat: -37.8045, lng: 144.992 },
  "melb-5": { lat: -37.8865, lng: 145.0245 },
};

const SEED_IMAGES = [
  "/images/directory/04.jpg",
  "/images/directory/10.jpg",
  "/images/directory/11.jpg",
  "/images/directory/12.jpg",
  "/images/directory/05.jpg",
];

/** Official verified course ladders (AUD) — 30m / 45m / 60m totals from venue rate pages. */
function seedCourseLadder(
  price30: number,
  price45: number,
  price60: number,
): Array<{ duration: string; price: number }> {
  return [
    { duration: "30m", price: price30 },
    { duration: "45m", price: price45 },
    { duration: "60m", price: price60 },
  ];
}

function venueCourseLadder(
  price30: number,
  price45: number,
  price60: number,
): VenuePriceRow[] {
  return [
    { label: "Standard", duration: "30 mins", price: `${price30}` },
    { label: "Standard", duration: "45 mins", price: `${price45}` },
    { label: "Standard", duration: "60 mins", price: `${price60}` },
  ];
}

export type SeedVenueRecord = {
  id: string;
  name: string;
  city: string;
  citySlug: string;
  category: "brothels" | "escorts-massage" | string;
  address: string;
  suburb: string;
  isCbd: boolean;
  phone: string;
  website: string;
  description: string;
  pricing: Array<{ duration: string; price: number }>;
  /** Seed badge tier — maps to queryable `badgeStatus` on directory venues. */
  tier: "managed_vip" | "enterprise" | "standard" | "verified_elite" | string;
  isVerified: boolean;
  tags: string[];
  ladies?: Array<{
    id: string;
    name: string;
    status: "Available Now" | "In Shift" | "Off Shift";
    image: string;
  }>;
  /** Optional direct messaging overrides for rapid Melbourne onboarding. */
  messaging?: VenueMessagingHandles;
  /** Optional explicit badge override (`verified_elite` / `managed_vip`). */
  badgeStatus?: VenueBadgeStatus;
};

/**
 * Original Sydney directory listings — preserved intact for Sydney city filter.
 */
export const sydneyVenues: Venue[] = [
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
    image: "/images/directory/01.jpg",
    tags: ["Cocktails", "Harbour", "Late"],
    tagsZh: ["鸡尾酒", "海港", "深夜"],
    phone: "0297019001",
    address: "1 Demo Quay, Sydney NSW 2000",
    lat: -33.861,
    lng: 151.211,
    isCbd: true,
    distanceFromCbdKm: 1.1,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$150" },
      { label: "Standard", duration: "45 mins", price: "$200" },
      { label: "Standard", duration: "60 mins", price: "$250" },
    ],
    rateLine: "$150/30m · $200/45m · $250/60m",
    fictional: true,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "harbour-glow-lounge-lady-1", name: "Jessica", status: "Available Now", image: "/images/staff/asian/04.jpg" },
      { id: "harbour-glow-lounge-lady-2", name: "Hannah", status: "In Shift", image: "/images/staff/asian/05.jpg" },
      { id: "harbour-glow-lounge-lady-3", name: "Maya", status: "Available Now", image: "/images/staff/asian/06.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "HeyBroHarbour",
      whatsapp: "0297019001",
    },
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
    image: "/images/directory/02.jpg",
    tags: ["Vinyl", "Small plates"],
    tagsZh: ["黑胶", "小食"],
    phone: "0297019002",
    address: "88 Demo Crown St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$150" },
      { label: "Standard", duration: "45 mins", price: "$200" },
      { label: "Standard", duration: "60 mins", price: "$250" },
    ],
    rateLine: "$150/30m · $200/45m · $250/60m",
    fictional: true,
    ladies: [
      { id: "surry-neon-room-lady-1", name: "Hannah", status: "Available Now", image: "/images/staff/asian/07.jpg" },
      { id: "surry-neon-room-lady-2", name: "Maya", status: "In Shift", image: "/images/staff/asian/08.jpg" },
      { id: "surry-neon-room-lady-3", name: "Chloe", status: "Available Now", image: "/images/staff/latina/01.jpg" },
    ],
    customHighlights: { tier: "free" },
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
    image: "/images/directory/03.jpg",
    tags: ["Late", "Stage"],
    tagsZh: ["深夜", "舞台"],
    phone: "0297019003",
    address: "12 Demo Darlinghurst Rd, Potts Point NSW 2011",
    lat: -33.874,
    lng: 151.224,
    isCbd: true,
    distanceFromCbdKm: 1.5,
    fictional: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$150" },
      { label: "Standard", duration: "45 mins", price: "$200" },
      { label: "Standard", duration: "60 mins", price: "$250" },
    ],
    rateLine: "$150/30m · $200/45m · $250/60m",
    ladies: [
      { id: "cross-stage-club-lady-1", name: "Maya", status: "Available Now", image: "/images/staff/latina/02.jpg" },
      { id: "cross-stage-club-lady-2", name: "Chloe", status: "In Shift", image: "/images/staff/latina/03.jpg" },
      { id: "cross-stage-club-lady-3", name: "Brooke", status: "Available Now", image: "/images/staff/latina/04.jpg" },
    ],
    customHighlights: { tier: "free" },
    hours: "Fri–Sat 9pm–3am",
  },
  {
    id: "cleopatras-gentlemans-club",
    name: "Cleopatra's Gentleman's Club",
    city: "sydney",
    suburb: "Wetherill Park",
    category: "brothels",
    description: "Award-winning Western Sydney gentlemen’s club with discreet parking, private introductions, and verified companions for English and Mandarin-speaking patrons.",
    image: "/images/directory/04.jpg",
    tags: ["Discreet Parking","Discreet Entrance","Meet and Greet Room"],
    phone: "(02) 9609 6668",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: "https://www.cleopatrasgentlemansclub.com.au/",
    hours: "Monday - Sunday 10am ‐ 5am",
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "cleopatras-gentlemans-club-lady-1", name: "Chloe", status: "Available Now", image: "/images/staff/black/01.jpg" },
      { id: "cleopatras-gentlemans-club-lady-2", name: "Brooke", status: "In Shift", image: "/images/staff/black/02.jpg" },
      { id: "cleopatras-gentlemans-club-lady-3", name: "Amber", status: "Available Now", image: "/images/staff/black/03.jpg" },
      { id: "cleopatras-gentlemans-club-lady-4", name: "Vanessa", status: "In Shift", image: "/images/staff/western/01.jpg" },
      { id: "cleopatras-gentlemans-club-lady-5", name: "Tiffany", status: "Available Now", image: "/images/staff/western/02.jpg" },
      { id: "cleopatras-gentlemans-club-lady-6", name: "Gia", status: "Off Shift", image: "/images/staff/western/03.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "cleopatrasgentle",
      whatsapp: "0296096668",
    },
  },
  {
    id: "my-girls-sydney",
    name: "My Girls Sydney",
    city: "sydney",
    suburb: "Potts Point",
    category: "brothels",
    description: "Premium Potts Point escort network linked with Michelle’s salon rates — discreet companionship bookings across Sydney.",
    image: "/images/directory/05.jpg",
    tags: ["Open 24 Hours"],
    phone: "(02) 9356 9569",
    address: "50 Kellett St, Potts Point NSW 2011",
    lat: -33.871,
    lng: 151.225,
    isCbd: true,
    distanceFromCbdKm: 1.5,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$265" },
      { label: "Standard", duration: "45 mins", price: "$320" },
      { label: "Standard", duration: "60 mins", price: "$375" },
    ],
    rateLine: "$265/30m · $320/45m · $375/60m",
    fictional: false,
    website: "https://www.mygirls.com.au/",
    hours: "Monday to Sunday 12am ‐ 12pm",
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "my-girls-sydney-lady-1", name: "Brooke", status: "Available Now", image: "/images/staff/western/04.jpg" },
      { id: "my-girls-sydney-lady-2", name: "Amber", status: "In Shift", image: "/images/staff/western/05.jpg" },
      { id: "my-girls-sydney-lady-3", name: "Vanessa", status: "Available Now", image: "/images/staff/western/06.jpg" },
      { id: "my-girls-sydney-lady-4", name: "Tiffany", status: "In Shift", image: "/images/staff/asian/01.jpg" },
      { id: "my-girls-sydney-lady-5", name: "Gia", status: "Available Now", image: "/images/staff/asian/02.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "mygirlssydney",
      whatsapp: "0293569569",
    },
  },
  {
    id: "cuties-escorts",
    name: "Cuties Escorts",
    city: "sydney",
    suburb: "Campbelltown",
    category: "brothels",
    description: "Campbelltown licensed brothel and escort venue with published short-course and hourly rates for south-west Sydney patrons.",
    image: "/images/directory/06.jpg",
    tags: ["Open 24 Hours", "Discreet Parking", "Discreet Entrance"],
    phone: "1300 288 437",
    address: "15 BLAXLAND ROAD, CAMPBELLTOWN NSW",
    lat: -34.065,
    lng: 150.814,
    isCbd: false,
    distanceFromCbdKm: 42.5,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$90" },
      { label: "Standard", duration: "45 mins", price: "$140" },
      { label: "Standard", duration: "60 mins", price: "$160" },
    ],
    rateLine: "$90/30m · $140/45m · $160/60m",
    fictional: false,
    website: "https://www.cutiesescorts.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "cuties-escorts-lady-1", name: "Amber", status: "Available Now", image: "/images/staff/asian/03.jpg" },
      { id: "cuties-escorts-lady-2", name: "Vanessa", status: "In Shift", image: "/images/staff/asian/04.jpg" },
      { id: "cuties-escorts-lady-3", name: "Tiffany", status: "Available Now", image: "/images/staff/asian/05.jpg" },
      { id: "cuties-escorts-lady-4", name: "Gia", status: "In Shift", image: "/images/staff/asian/06.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "cutiesescorts",
      whatsapp: "1300288437",
    },
  },

  {
    id: "dream-girl-130",
    name: "Dream Girl 130",
    city: "sydney",
    suburb: "Alexandria",
    category: "brothels",
    description: "Alexandria studio near the CBD offering professional erotic massage courses with private rooms and discreet entry.",
    image: "/images/directory/07.jpg",
    tags: ["Discreet Parking","Essentials Provided"],
    phone: "0426 030 130",
    address: "130 BOTANY RD, ALEXANDRIA NSW",
    lat: -33.901,
    lng: 151.193,
    isCbd: false,
    distanceFromCbdKm: 3.9,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$100" },
      { label: "Standard", duration: "45 mins", price: "$125" },
      { label: "Standard", duration: "60 mins", price: "$140" },
    ],
    rateLine: "$100/30m · $125/45m · $140/60m",
    fictional: false,
    website: "http://www.massagecbd.com/",
    hours: "Monday-Sunday 10AM ‐ 8PM; (last booking at 8pm) ‐",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "dream-girl-130-lady-1", name: "Vanessa", status: "Available Now", image: "/images/staff/asian/07.jpg" },
      { id: "dream-girl-130-lady-2", name: "Tiffany", status: "In Shift", image: "/images/staff/asian/08.jpg" },
      { id: "dream-girl-130-lady-3", name: "Gia", status: "Available Now", image: "/images/staff/latina/01.jpg" },
      { id: "dream-girl-130-lady-4", name: "Jessica", status: "In Shift", image: "/images/staff/latina/02.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "sydney-empress-69",
    name: "Sydney Empress 69",
    city: "sydney",
    suburb: "Haymarket",
    category: "brothels",
    description: "Haymarket Town Hall studio with a large daily roster, private air-conditioned rooms, and published 30/45/60 course rates.",
    image: "/images/directory/08.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "0451 079 669",
    address: "LEVEL 1, 69 LIVERPOOL ST, HAYMARKET NSW (corner of Liverpool St and Kent St)",
    lat: -33.879,
    lng: 151.205,
    isCbd: true,
    distanceFromCbdKm: 1.2,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$110" },
      { label: "Standard", duration: "45 mins", price: "$130" },
      { label: "Standard", duration: "60 mins", price: "$150" },
    ],
    rateLine: "$110/30m · $130/45m · $150/60m",
    fictional: false,
    website: "http://www.massagecbd.com.au/",
    hours: "Every Day 10 am ‐ 8 pm",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "sydney-empress-69-lady-1", name: "Tiffany", status: "Available Now", image: "/images/staff/latina/03.jpg" },
      { id: "sydney-empress-69-lady-2", name: "Gia", status: "In Shift", image: "/images/staff/latina/04.jpg" },
      { id: "sydney-empress-69-lady-3", name: "Jessica", status: "Available Now", image: "/images/staff/black/01.jpg" },
      { id: "sydney-empress-69-lady-4", name: "Hannah", status: "In Shift", image: "/images/staff/black/02.jpg" },
      { id: "sydney-empress-69-lady-5", name: "Maya", status: "Available Now", image: "/images/staff/black/03.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "tiffanys",
    name: "Tiffany's",
    city: "sydney",
    suburb: "Surry Hills",
    category: "brothels",
    description: "Long-established Surry Hills gentlemen’s club with regular and spa rooms, discreet billing, and published course rates.",
    image: "/images/directory/09.jpg",
    tags: ["Complimentary Drinks and Snacks","Discreet Entrance","Meet and Greet Room"],
    phone: "(02) 9212 1195",
    address: "99 Albion St, Surry Hills NSW",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$230" },
      { label: "Standard", duration: "45 mins", price: "$300" },
      { label: "Standard", duration: "60 mins", price: "$340" },
    ],
    rateLine: "$230/30m · $300/45m · $340/60m",
    fictional: false,
    website: "http://www.tiffanysgirls.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "tiffanys-lady-1", name: "Gia", status: "Available Now", image: "/images/staff/western/01.jpg" },
      { id: "tiffanys-lady-2", name: "Jessica", status: "In Shift", image: "/images/staff/western/02.jpg" },
      { id: "tiffanys-lady-3", name: "Hannah", status: "Available Now", image: "/images/staff/western/03.jpg" },
      { id: "tiffanys-lady-4", name: "Maya", status: "In Shift", image: "/images/staff/western/04.jpg" },
      { id: "tiffanys-lady-5", name: "Chloe", status: "Available Now", image: "/images/staff/western/05.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "tiffanys",
      whatsapp: "0292121195",
    },
  },
  {
    id: "a-touch-more-class-formerly-a-touch-of-class",
    name: "A Touch More Class (formerly A Touch of Class)",
    city: "sydney",
    suburb: "Surry Hills",
    category: "brothels",
    description: "Surry Hills six-star house with private introductions, deluxe girlfriend-experience bookings, and 24/7 availability.",
    image: "/images/directory/10.jpg",
    tags: ["Discreet Entrance","Meet and Greet Room","Jacuzzi and Spa"],
    phone: "(02) 9212 4455",
    address: "377 Riley St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$220" },
      { label: "Standard", duration: "45 mins", price: "$300" },
      { label: "Standard", duration: "60 mins", price: "$350" },
    ],
    rateLine: "$220/30m · $300/45m · $350/60m",
    fictional: false,
    website: "https://www.atouchofclass.net.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "a-touch-more-class-formerly-a-touch-of-class-lady-1", name: "Jessica", status: "Available Now", image: "/images/staff/western/06.jpg" },
      { id: "a-touch-more-class-formerly-a-touch-of-class-lady-2", name: "Hannah", status: "In Shift", image: "/images/staff/asian/01.jpg" },
      { id: "a-touch-more-class-formerly-a-touch-of-class-lady-3", name: "Maya", status: "Available Now", image: "/images/staff/asian/02.jpg" },
      { id: "a-touch-more-class-formerly-a-touch-of-class-lady-4", name: "Chloe", status: "In Shift", image: "/images/staff/asian/03.jpg" },
      { id: "a-touch-more-class-formerly-a-touch-of-class-lady-5", name: "Brooke", status: "Available Now", image: "/images/staff/asian/04.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "atouchmoreclassf",
      whatsapp: "0292124455",
    },
  },
  {
    id: "ginza-club",
    name: "Ginza Club",
    city: "sydney",
    suburb: "Surry Hills",
    category: "brothels",
    description: "Surry Hills Asian bordello with themed private rooms and a published Diamond full-service course guide.",
    image: "/images/directory/11.jpg",
    tags: ["Meet and Greet Room","Jacuzzi and Spa"],
    phone: "02 7901 3000",
    address: "310 Cleveland St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$160" },
      { label: "Standard", duration: "45 mins", price: "$220" },
      { label: "Standard", duration: "60 mins", price: "$280" },
    ],
    rateLine: "$160/30m · $220/45m · $280/60m",
    fictional: false,
    website: "http://ginzaclub.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "ginza-club-lady-1", name: "Hannah", status: "Available Now", image: "/images/staff/asian/05.jpg" },
      { id: "ginza-club-lady-2", name: "Maya", status: "In Shift", image: "/images/staff/asian/06.jpg" },
      { id: "ginza-club-lady-3", name: "Chloe", status: "Available Now", image: "/images/staff/asian/07.jpg" },
      { id: "ginza-club-lady-4", name: "Brooke", status: "In Shift", image: "/images/staff/asian/08.jpg" },
      { id: "ginza-club-lady-5", name: "Amber", status: "Available Now", image: "/images/staff/latina/01.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "ginzaclub",
      whatsapp: "0279013000",
    },
  },
  {
    id: "liaisons",
    name: "Liaisons",
    city: "sydney",
    suburb: "Edgecliff",
    category: "brothels",
    description: "Multi-award Edgecliff establishment minutes from the CBD with deluxe inclusive course rates and discreet facilities.",
    image: "/images/directory/12.jpg",
    tags: ["Open 24 Hours","Complimentary Drinks and Snacks","Essentials Provided"],
    phone: "0488 551 025",
    address: "535 Glenmore Road, Edgecliff NSW 2027",
    lat: -33.879,
    lng: 151.237,
    isCbd: false,
    distanceFromCbdKm: 2.8,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$260" },
      { label: "Standard", duration: "45 mins", price: "$330" },
      { label: "Standard", duration: "60 mins", price: "$400" },
    ],
    rateLine: "$260/30m · $330/45m · $400/60m",
    fictional: false,
    website: "https://www.liaisons.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
    ladies: [
      { id: "liaisons-lady-1", name: "Maya", status: "Available Now", image: "/images/staff/latina/02.jpg" },
      { id: "liaisons-lady-2", name: "Chloe", status: "In Shift", image: "/images/staff/latina/03.jpg" },
      { id: "liaisons-lady-3", name: "Brooke", status: "Available Now", image: "/images/staff/latina/04.jpg" },
      { id: "liaisons-lady-4", name: "Amber", status: "In Shift", image: "/images/staff/black/01.jpg" },
      { id: "liaisons-lady-5", name: "Vanessa", status: "Available Now", image: "/images/staff/black/02.jpg" },
    ],
    customHighlights: {
      tier: "vip",
      managedBadge: "vip",
      wechat: "liaisons",
      whatsapp: "0488551025",
    },
  },
  {
    id: "wives-only",
    name: "Wives Only",
    city: "sydney",
    suburb: "St Peters",
    category: "brothels",
    description: "St Peters boutique brothel with discreet King Street entry, published 30/45/60 totals, and on-site ATM.",
    image: "/images/directory/13.jpg",
    tags: ["Discreet Entrance","Meet and Greet Room","Essentials Provided"],
    phone: "(02) 9519 6756",
    address: "673 King St, St Peters NSW 2044",
    lat: -33.911,
    lng: 151.181,
    isCbd: false,
    distanceFromCbdKm: 5.4,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$210" },
      { label: "Standard", duration: "45 mins", price: "$280" },
      { label: "Standard", duration: "60 mins", price: "$330" },
    ],
    rateLine: "$210/30m · $280/45m · $330/60m",
    fictional: false,
    website: "http://www.wivesonly.com.au/",
    hours: "Sunday 11am ‐ 2am; Monday 11am ‐ 3am; Tuesday 11am ‐ 3am; Wednesday 11am ‐ 3am; Thursday 11am ‐ 3am; Friday 11pm ‐ 5am; Saturday 11pm ‐ 5am",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "wives-only-lady-1", name: "Chloe", status: "Available Now", image: "/images/staff/black/03.jpg" },
      { id: "wives-only-lady-2", name: "Brooke", status: "In Shift", image: "/images/staff/western/01.jpg" },
      { id: "wives-only-lady-3", name: "Amber", status: "Available Now", image: "/images/staff/western/02.jpg" },
      { id: "wives-only-lady-4", name: "Vanessa", status: "In Shift", image: "/images/staff/western/03.jpg" },
      { id: "wives-only-lady-5", name: "Tiffany", status: "Available Now", image: "/images/staff/western/04.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "sydney-asian-brothels",
    name: "Sydney Asian Brothels",
    city: "sydney",
    suburb: "Wetherill Park",
    category: "brothels",
    description: "Western Sydney Asian companion house aligned with Cleopatra network standards and verified course rates.",
    image: "/images/directory/14.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: undefined,
    hours: undefined,
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "sydney-asian-brothels-lady-1", name: "Brooke", status: "Available Now", image: "/images/staff/western/05.jpg" },
      { id: "sydney-asian-brothels-lady-2", name: "Amber", status: "In Shift", image: "/images/staff/western/06.jpg" },
      { id: "sydney-asian-brothels-lady-3", name: "Vanessa", status: "Available Now", image: "/images/staff/asian/01.jpg" },
      { id: "sydney-asian-brothels-lady-4", name: "Tiffany", status: "In Shift", image: "/images/staff/asian/02.jpg" },
      { id: "sydney-asian-brothels-lady-5", name: "Gia", status: "Available Now", image: "/images/staff/asian/03.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "maggies-girls-sydney",
    name: "Maggie's Girls Sydney",
    city: "sydney",
    suburb: "Wetherill Park",
    category: "brothels",
    description: "Iconic Potts Point six-star house with transparent room-hire plus host fee estimates for 30/45/60 bookings.",
    image: "/images/directory/15.jpg",
    tags: ["Discreet Parking","Discreet Entrance","Essentials Provided"],
    phone: "0475 630 753",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$220" },
      { label: "Standard", duration: "45 mins", price: "$280" },
      { label: "Standard", duration: "60 mins", price: "$350" },
    ],
    rateLine: "$220/30m · $280/45m · $350/60m",
    fictional: false,
    website: "https://www.maggiesgirlssydney.com.au/",
    hours: "Every Day 12.30 PM ‐ 6 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "maggies-girls-sydney-lady-1", name: "Amber", status: "Available Now", image: "/images/staff/asian/04.jpg" },
      { id: "maggies-girls-sydney-lady-2", name: "Vanessa", status: "In Shift", image: "/images/staff/asian/05.jpg" },
      { id: "maggies-girls-sydney-lady-3", name: "Tiffany", status: "Available Now", image: "/images/staff/asian/06.jpg" },
      { id: "maggies-girls-sydney-lady-4", name: "Gia", status: "In Shift", image: "/images/staff/asian/07.jpg" },
      { id: "maggies-girls-sydney-lady-5", name: "Jessica", status: "Available Now", image: "/images/staff/asian/08.jpg" },
      { id: "maggies-girls-sydney-lady-6", name: "Hannah", status: "Off Shift", image: "/images/staff/latina/01.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "pink-house",
    name: "Pink House",
    city: "sydney",
    suburb: "Greenacre",
    category: "brothels",
    description: "Greenacre adult entertainment club with published Standard course rates and discreet EFTPOS billing.",
    image: "/images/directory/16.jpg",
    tags: ["Discreet Parking"],
    phone: "0451 512 012",
    address: "12 Norfolk Rd, Greenacre NSW 2190",
    lat: -33.905,
    lng: 151.058,
    isCbd: false,
    distanceFromCbdKm: 14.5,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$120" },
      { label: "Standard", duration: "45 mins", price: "$140" },
      { label: "Standard", duration: "60 mins", price: "$200" },
    ],
    rateLine: "$120/30m · $140/45m · $200/60m",
    fictional: false,
    website: "https://www.greenacrebrothel.com.au/",
    hours: "Open 7 Days 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "pink-house-lady-1", name: "Vanessa", status: "Available Now", image: "/images/staff/latina/02.jpg" },
      { id: "pink-house-lady-2", name: "Tiffany", status: "In Shift", image: "/images/staff/latina/03.jpg" },
      { id: "pink-house-lady-3", name: "Gia", status: "Available Now", image: "/images/staff/latina/04.jpg" },
      { id: "pink-house-lady-4", name: "Jessica", status: "In Shift", image: "/images/staff/black/01.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "the-nightshade",
    name: "The Nightshade",
    city: "sydney",
    suburb: "Gladesville",
    category: "brothels",
    description: "Gladesville multi-room establishment with published Western and Asian course guides from 30 to 60 minutes.",
    image: "/images/directory/17.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "0498 100 011",
    address: "2/42 Buffalo Road, Gladesville NSW 2111",
    lat: -33.833,
    lng: 151.125,
    isCbd: false,
    distanceFromCbdKm: 8.7,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$170" },
      { label: "Standard", duration: "45 mins", price: "$220" },
      { label: "Standard", duration: "60 mins", price: "$270" },
    ],
    rateLine: "$170/30m · $220/45m · $270/60m",
    fictional: false,
    website: "https://thenightshade.com.au/",
    hours: "Every Day 10 AM ‐ Til Late",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "the-nightshade-lady-1", name: "Tiffany", status: "Available Now", image: "/images/staff/black/02.jpg" },
      { id: "the-nightshade-lady-2", name: "Gia", status: "In Shift", image: "/images/staff/black/03.jpg" },
      { id: "the-nightshade-lady-3", name: "Jessica", status: "Available Now", image: "/images/staff/western/01.jpg" },
      { id: "the-nightshade-lady-4", name: "Hannah", status: "In Shift", image: "/images/staff/western/02.jpg" },
      { id: "the-nightshade-lady-5", name: "Maya", status: "Available Now", image: "/images/staff/western/03.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "sweet-babe-181",
    name: "Sweet Babe 181",
    city: "sydney",
    suburb: "Smithfield",
    category: "brothels",
    description: "Smithfield studio with published starting 30/45/60 course rates and discreet local access.",
    image: "/images/directory/18.jpg",
    tags: ["Discreet Parking","Discreet Entrance"],
    phone: "(02) 9681 3698",
    address: "1/181 McCredie Road, Smithfield NSW 2164",
    lat: -33.85,
    lng: 150.94,
    isCbd: false,
    distanceFromCbdKm: 25,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$110" },
      { label: "Standard", duration: "45 mins", price: "$160" },
      { label: "Standard", duration: "60 mins", price: "$180" },
    ],
    rateLine: "$110/30m · $160/45m · $180/60m",
    fictional: false,
    website: "https://sweetbabe181.com.au/",
    hours: "Monday 10 AM ‐ 2 AM; Tuesday 10 AM ‐ 2 AM; Wednesday 10 AM ‐ 2 AM; Thursday 10 AM ‐ 2 AM; Friday 10 AM ‐ 5 AM; Saturday 10 AM ‐ 6 AM; Sunday 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "sweet-babe-181-lady-1", name: "Gia", status: "Available Now", image: "/images/staff/western/04.jpg" },
      { id: "sweet-babe-181-lady-2", name: "Jessica", status: "In Shift", image: "/images/staff/western/05.jpg" },
      { id: "sweet-babe-181-lady-3", name: "Hannah", status: "Available Now", image: "/images/staff/western/06.jpg" },
      { id: "sweet-babe-181-lady-4", name: "Maya", status: "In Shift", image: "/images/staff/asian/01.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "casablanca-gentlemans-club",
    name: "Casablanca Gentleman's Club",
    city: "sydney",
    suburb: "Liverpool",
    category: "brothels",
    description: "Liverpool gentlemen’s club with published course rates, private suites, and discreet facilities for south-west Sydney patrons.",
    image: "/images/directory/19.jpg",
    tags: ["Discreet Parking", "Discreet Entrance", "Essentials Provided"],
    phone: "(02) 9822 4830",
    address: "239 Northumberland St, Liverpool NSW 2170",
    lat: -33.925,
    lng: 150.924,
    isCbd: false,
    distanceFromCbdKm: 27.1,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$160" },
      { label: "Standard", duration: "45 mins", price: "$230" },
      { label: "Standard", duration: "60 mins", price: "$280" },
    ],
    rateLine: "$160/30m · $230/45m · $280/60m",
    fictional: false,
    website: undefined,
    hours: "Monday to Wednesday Noon ‐ 2am; Thursday Noon ‐ 3am; Friday to Saturday Noon ‐ 5am; Sunday 4pm ‐ 2am",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "casablanca-gentlemans-club-lady-1", name: "Jessica", status: "Available Now", image: "/images/staff/asian/02.jpg" },
      { id: "casablanca-gentlemans-club-lady-2", name: "Hannah", status: "In Shift", image: "/images/staff/asian/03.jpg" },
      { id: "casablanca-gentlemans-club-lady-3", name: "Maya", status: "Available Now", image: "/images/staff/asian/04.jpg" },
      { id: "casablanca-gentlemans-club-lady-4", name: "Chloe", status: "In Shift", image: "/images/staff/asian/05.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },

  {
    id: "mistiques",
    name: "Mistiques",
    city: "sydney",
    suburb: "Newtown",
    category: "brothels",
    description: "Newtown companion house with discreet entry and verified standard course rates for inner-west patrons.",
    image: "/images/directory/20.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "70 Enmore Road, Newtown NSW 2042",
    lat: -33.898,
    lng: 151.179,
    isCbd: false,
    distanceFromCbdKm: 4.3,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: undefined,
    hours: "Every Day 10 AM ‐ Til Late",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "mistiques-lady-1", name: "Hannah", status: "Available Now", image: "/images/staff/asian/06.jpg" },
      { id: "mistiques-lady-2", name: "Maya", status: "In Shift", image: "/images/staff/asian/07.jpg" },
      { id: "mistiques-lady-3", name: "Chloe", status: "Available Now", image: "/images/staff/asian/08.jpg" },
      { id: "mistiques-lady-4", name: "Brooke", status: "In Shift", image: "/images/staff/latina/01.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "five-star-moon",
    name: "Five Star Moon",
    city: "sydney",
    suburb: "Auburn",
    category: "brothels",
    description: "Auburn venue with private rooms and verified standard course rates for Western Sydney visitors.",
    image: "/images/directory/21.jpg",
    tags: ["Open 24 Hours","Discreet Parking","Discreet Entrance"],
    phone: "(02) 9609 6668",
    address: "87 Rawson St, Auburn NSW 2144",
    lat: -33.849,
    lng: 151.033,
    isCbd: false,
    distanceFromCbdKm: 16.4,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: undefined,
    hours: "Every Day 12 AM ‐ 12 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "five-star-moon-lady-1", name: "Maya", status: "Available Now", image: "/images/staff/latina/02.jpg" },
      { id: "five-star-moon-lady-2", name: "Chloe", status: "In Shift", image: "/images/staff/latina/03.jpg" },
      { id: "five-star-moon-lady-3", name: "Brooke", status: "Available Now", image: "/images/staff/latina/04.jpg" },
      { id: "five-star-moon-lady-4", name: "Amber", status: "In Shift", image: "/images/staff/black/01.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "jk80-gentlemen-club",
    name: "JK80 Gentlemen Club",
    city: "sydney",
    suburb: "Sydney",
    category: "brothels",
    description: "Sydney CBD gentlemen’s club with discreet facilities and verified standard course rates.",
    image: "/images/directory/22.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "80 Erskine St, Sydney NSW 2000",
    lat: -33.8688,
    lng: 151.2093,
    isCbd: true,
    distanceFromCbdKm: 0,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: undefined,
    hours: "Monday to Friday 10 AM ‐ 4 AM; Saturday 12 PM ‐ 4 AM; Sunday 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "jk80-gentlemen-club-lady-1", name: "Chloe", status: "Available Now", image: "/images/staff/black/02.jpg" },
      { id: "jk80-gentlemen-club-lady-2", name: "Brooke", status: "In Shift", image: "/images/staff/black/03.jpg" },
      { id: "jk80-gentlemen-club-lady-3", name: "Amber", status: "Available Now", image: "/images/staff/western/01.jpg" },
      { id: "jk80-gentlemen-club-lady-4", name: "Vanessa", status: "In Shift", image: "/images/staff/western/02.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
  {
    id: "57-burwood-brothel",
    name: "57 Burwood Brothel",
    city: "sydney",
    suburb: "Burwood",
    category: "brothels",
    description: "Burwood Inner West house with a rotating Asian roster and verified standard course rates.",
    image: "/images/directory/23.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "57 George St, Burwood NSW 2134",
    lat: -33.877,
    lng: 151.104,
    isCbd: false,
    distanceFromCbdKm: 9.8,
    verified: true,
    pricing: [
      { label: "Standard", duration: "30 mins", price: "$285" },
      { label: "Standard", duration: "45 mins", price: "$365" },
      { label: "Standard", duration: "60 mins", price: "$420" },
    ],
    rateLine: "$285/30m · $365/45m · $420/60m",
    fictional: false,
    website: undefined,
    hours: "Monday to Wednesday 10.30 AM ‐ 3 AM; Thursday 10.30 AM ‐ 3.30 AM; Friday to Saturday 10.30 AM ‐ 4 AM; Sunday 10.30 AM ‐ 3 AM",
    isManaged: false,
    managedBadge: undefined,
    ladies: [
      { id: "57-burwood-brothel-lady-1", name: "Brooke", status: "Available Now", image: "/images/staff/western/03.jpg" },
      { id: "57-burwood-brothel-lady-2", name: "Amber", status: "In Shift", image: "/images/staff/western/04.jpg" },
      { id: "57-burwood-brothel-lady-3", name: "Vanessa", status: "Available Now", image: "/images/staff/western/05.jpg" },
      { id: "57-burwood-brothel-lady-4", name: "Tiffany", status: "In Shift", image: "/images/staff/western/06.jpg" },
    ],
    customHighlights: {
      tier: "free",
    },
  },
];

/**
 * Verified Melbourne directory seed — English-only copy for local EN/ZH patrons.
 */
export const melbourneVenues: SeedVenueRecord[] = [
  {
    id: "melb-1",
    name: "Manhattan Terrace",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "554-556 Swanston St, Carlton VIC 3053",
    suburb: "Carlton",
    isCbd: true,
    phone: "0478 575 305",
    website: "https://www.manhattanterrace.com.au",
    description:
      "Elite Melbourne Lineup · Instant 30/45/60min Booking & Verification. Flagship CBD companion house with 24/7 in-call and out-call service.",
    pricing: [
      { duration: "30m", price: 275 },
      { duration: "45m", price: 335 },
      { duration: "60m", price: 395 },
    ],
    tier: "enterprise",
    isVerified: true,
    tags: ["CBD First", "Cash OK", "EFTPOS", "24/7 Available"],
    ladies: [
      { id: "melb-1-lady-1", name: "Mia", status: "Available Now", image: "/images/staff/western/01.jpg" },
      { id: "melb-1-lady-2", name: "Ella", status: "In Shift", image: "/images/staff/western/02.jpg" },
      { id: "melb-1-lady-3", name: "Audrey", status: "Available Now", image: "/images/staff/western/03.jpg" },
      { id: "melb-1-lady-4", name: "Chanel", status: "In Shift", image: "/images/staff/western/04.jpg" },
      { id: "melb-1-lady-5", name: "Sophie", status: "Available Now", image: "/images/staff/western/05.jpg" },
    ],
  },
  {
    id: "melb-2",
    name: "Top Of The Town",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "516-518 Flinders St, Melbourne VIC 3000",
    suburb: "Melbourne CBD",
    isCbd: true,
    phone: "(03) 9614 1414",
    website: "https://www.518flinders.com.au",
    description:
      "Elite Melbourne Lineup · Instant 30/45/60min Booking & Verification. Premier Flinders Street venue near Crown with discreet high-end service.",
    pricing: [
      { duration: "30m", price: 220 },
      { duration: "45m", price: 280 },
      { duration: "60m", price: 340 },
    ],
    tier: "managed_vip",
    isVerified: true,
    tags: ["CBD First", "WeChat Pay", "Discrete Entrance", "Premium VIP"],
    ladies: [
      { id: "melb-2-lady-1", name: "Sienna", status: "Available Now", image: "/images/staff/asian/01.jpg" },
      { id: "melb-2-lady-2", name: "Chloe", status: "In Shift", image: "/images/staff/asian/02.jpg" },
      { id: "melb-2-lady-3", name: "Scarlett", status: "Available Now", image: "/images/staff/asian/03.jpg" },
      { id: "melb-2-lady-4", name: "Isabelle", status: "In Shift", image: "/images/staff/asian/04.jpg" },
      { id: "melb-2-lady-5", name: "Gigi", status: "Available Now", image: "/images/staff/asian/05.jpg" },
      { id: "melb-2-lady-6", name: "Zara", status: "Off Shift", image: "/images/staff/asian/06.jpg" },
    ],
  },
  {
    id: "melb-3",
    name: "Gotham City House of Sin",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "70-74 Clarke St, South Melbourne VIC 3205",
    suburb: "South Melbourne",
    isCbd: true,
    phone: "(03) 9699 9269",
    website: "https://gotham-city.com.au",
    description:
      "South Melbourne luxury house with opulent suites, verified companions, and polished service for English and Mandarin-speaking patrons.",
    pricing: [
      { duration: "30m", price: 320 },
      { duration: "45m", price: 430 },
      { duration: "60m", price: 480 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "Private Shower", "Luxury Complex"],
    ladies: [
      { id: "melb-3-lady-1", name: "Lexi", status: "Available Now", image: "/images/staff/latina/01.jpg" },
      { id: "melb-3-lady-2", name: "Paris", status: "In Shift", image: "/images/staff/latina/02.jpg" },
      { id: "melb-3-lady-3", name: "Keeley", status: "Available Now", image: "/images/staff/latina/03.jpg" },
      { id: "melb-3-lady-4", name: "Angelina", status: "In Shift", image: "/images/staff/black/01.jpg" },
      { id: "melb-3-lady-5", name: "Crystal", status: "Available Now", image: "/images/staff/black/02.jpg" },
    ],
  },
  {
    id: "melb-4",
    name: "Club Collingwood (Le Boudoir)",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "81 Rokeby St, Collingwood VIC 3066",
    suburb: "Collingwood",
    isCbd: false,
    phone: "(03) 9415 8055",
    website: "https://www.clubcollingwood.au",
    description:
      "Female-operated Collingwood house five minutes from the CBD — discreet entry, respectful service, and verified companions for Melbourne patrons.",
    pricing: [
      { duration: "30m", price: 260 },
      { duration: "45m", price: 310 },
      { duration: "60m", price: 360 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["Cash OK", "Female Operated", "Discreet"],
    ladies: [
      { id: "melb-4-lady-1", name: "Ruby", status: "Available Now", image: "/images/staff/western/02.jpg" },
      { id: "melb-4-lady-2", name: "Grace", status: "In Shift", image: "/images/staff/western/03.jpg" },
      { id: "melb-4-lady-3", name: "Harper", status: "Available Now", image: "/images/staff/western/04.jpg" },
      { id: "melb-4-lady-4", name: "Lily", status: "In Shift", image: "/images/staff/western/05.jpg" },
    ],
  },
  {
    id: "melb-5",
    name: "Bambra Studio",
    city: "Melbourne",
    citySlug: "melbourne",
    category: "brothels",
    address: "977 Glen Huntly Rd, Caulfield VIC 3162",
    suburb: "Caulfield",
    isCbd: false,
    phone: "(03) 9563 6221",
    website: "https://www.bambrabrothelmelbourne.com.au",
    description:
      "Caulfield six-star gentlemen club with marble suites, a refined lounge atmosphere, and polished companion booking for Melbourne visitors.",
    pricing: [
      { duration: "30m", price: 250 },
      { duration: "45m", price: 300 },
      { duration: "60m", price: 350 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "VIP Lounge", "Six-Star"],
    ladies: [
      { id: "melb-5-lady-1", name: "Victoria", status: "Available Now", image: "/images/staff/asian/02.jpg" },
      { id: "melb-5-lady-2", name: "Anastasia", status: "In Shift", image: "/images/staff/asian/03.jpg" },
      { id: "melb-5-lady-3", name: "Camilla", status: "Available Now", image: "/images/staff/asian/04.jpg" },
      { id: "melb-5-lady-4", name: "Sasha", status: "In Shift", image: "/images/staff/asian/05.jpg" },
    ],
  },
];

/** @deprecated Prefer `melbourneVenues` — kept for HomeFeed / venue-list imports. */
export const seedVenues = melbourneVenues;

function normalizeSeedCity(seed: SeedVenueRecord): CityId {
  const slug = (seed.citySlug || seed.city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (slug === "sydney" || seed.city.toLowerCase() === "sydney") return "sydney";
  if (slug === "melbourne" || seed.city.toLowerCase() === "melbourne") {
    return "melbourne";
  }
  return "melbourne";
}

function normalizeSeedCategory(value: string): CategoryId {
  const category = value.trim().toLowerCase();
  if (category === "escorts-massage" || category.includes("escort")) {
    return "escorts-massage";
  }
  return "brothels";
}

function seedPricingRows(
  pricing: SeedVenueRecord["pricing"],
): VenuePriceRow[] {
  return pricing.map((row) => {
    const mins = Number.parseInt(row.duration, 10) || 0;
    return {
      label: "Standard",
      duration: mins ? `${mins} mins` : row.duration,
      price: `$${row.price}`,
    };
  });
}

function amenitiesFromTags(tags: string[]): VenueAmenityChip[] {
  const pool: VenueAmenityChip[] = [
    "Discreet Entrance",
    "Private Shower",
    "Air Conditioned",
    "Essentials Provided",
  ];
  const matched = pool.filter((chip) =>
    tags.some((tag) => tag.toLowerCase().includes(chip.toLowerCase().split(" ")[0])),
  );
  return matched.length ? matched : ["Discreet Entrance", "Private Shower"];
}

/** Map seed / listing tier fields onto queryable badge statuses. */
export function resolveVenueBadgeStatus(
  venue: Pick<
    Venue,
    "badgeStatus" | "isManaged" | "managedBadge" | "customHighlights" | "verified"
  > & { tier?: string },
): VenueBadgeStatus {
  if (
    venue.badgeStatus === "verified_elite" ||
    venue.badgeStatus === "managed_vip" ||
    venue.badgeStatus === "enterprise" ||
    venue.badgeStatus === "basic"
  ) {
    return venue.badgeStatus;
  }
  const tier = venue.customHighlights?.tier || venue.tier;
  if (tier === "enterprise") return "enterprise";
  if (tier === "verified_elite") return "verified_elite";
  if (
    tier === "managed_vip" ||
    tier === "vip" ||
    tier === "managed" ||
    venue.managedBadge === "vip" ||
    venue.customHighlights?.managedBadge === "vip" ||
    venue.isManaged
  ) {
    return venue.verified === false ? "managed_vip" : "verified_elite";
  }
  return "basic";
}

/** Active companions — Available Now statuses, else full roster length. */
export function resolveActiveRosterCount(
  venue: Pick<Venue, "ladies" | "activeRosterCount">,
): number {
  if (
    typeof venue.activeRosterCount === "number" &&
    Number.isFinite(venue.activeRosterCount)
  ) {
    return Math.max(0, Math.floor(venue.activeRosterCount));
  }
  const ladies = Array.isArray(venue.ladies) ? venue.ladies : [];
  if (!ladies.length) return 0;
  const active = ladies.filter((lady) =>
    /available/i.test(String(lady.status || "")),
  ).length;
  return active > 0 ? active : ladies.length;
}

/** Direct messaging handles for Call / WhatsApp / WeChat conversion CTAs. */
export function resolveVenueMessaging(
  venue: Pick<Venue, "phone" | "messaging" | "customHighlights" | "id">,
): VenueMessagingHandles {
  const phone = venue.messaging?.phone || venue.phone || null;
  return {
    phone,
    whatsapp:
      venue.messaging?.whatsapp ||
      venue.customHighlights?.whatsapp ||
      (phone ? phone.replace(/[^\d+]/g, "") : null),
    wechat:
      venue.messaging?.wechat ||
      venue.customHighlights?.wechat ||
      (venue.id ? venue.id.replace(/-/g, "") : null),
    telegram: venue.messaging?.telegram || venue.customHighlights?.telegram || null,
  };
}

/**
 * Attach Day-6 queryable badge / roster / messaging fields without wiping
 * existing Sydney or Melbourne catalog rows.
 */
export function withDirectorySchema<T extends Venue>(venue: T): T {
  const badgeStatus = resolveVenueBadgeStatus(venue);
  const activeRosterCount = resolveActiveRosterCount(venue);
  const messaging = resolveVenueMessaging(venue);
  const isManaged =
    badgeStatus === "verified_elite" ||
    badgeStatus === "managed_vip" ||
    badgeStatus === "enterprise" ||
    Boolean(venue.isManaged);
  return {
    ...venue,
    badgeStatus,
    activeRosterCount,
    messaging,
    isManaged,
    managedBadge:
      badgeStatus === "basic" ? venue.managedBadge : venue.managedBadge || "vip",
    customHighlights: {
      ...(venue.customHighlights || {}),
      managedBadge:
        badgeStatus === "basic"
          ? venue.customHighlights?.managedBadge
          : venue.customHighlights?.managedBadge || "vip",
      tier:
        venue.customHighlights?.tier ||
        (badgeStatus === "enterprise"
          ? "enterprise"
          : badgeStatus === "basic"
            ? "free"
            : "vip"),
      wechat: messaging.wechat,
      whatsapp: messaging.whatsapp,
      telegram: messaging.telegram,
    },
  };
}

export type DirectoryVenueQuery = {
  city?: CityId | string;
  badgeStatus?: VenueBadgeStatus | VenueBadgeStatus[];
  isCbd?: boolean;
  minActiveRoster?: number;
  hasMessaging?: boolean;
};

/** Filter the unified catalog by badge / CBD / roster / messaging handles. */
export function queryDirectoryVenues(
  filters: DirectoryVenueQuery = {},
  catalog?: Venue[],
): Venue[] {
  const source = (catalog || getSeedDirectoryVenues()).map(withDirectorySchema);
  const badges = filters.badgeStatus
    ? Array.isArray(filters.badgeStatus)
      ? filters.badgeStatus
      : [filters.badgeStatus]
    : null;
  return source.filter((venue) => {
    if (filters.city && String(venue.city) !== String(filters.city)) return false;
    if (typeof filters.isCbd === "boolean" && Boolean(venue.isCbd) !== filters.isCbd) {
      return false;
    }
    if (badges && !badges.includes(resolveVenueBadgeStatus(venue))) return false;
    if (
      typeof filters.minActiveRoster === "number" &&
      resolveActiveRosterCount(venue) < filters.minActiveRoster
    ) {
      return false;
    }
    if (filters.hasMessaging) {
      const handles = resolveVenueMessaging(venue);
      if (!handles.phone && !handles.whatsapp && !handles.wechat) return false;
    }
    return true;
  });
}

/** CBD-first Melbourne rows ready for rapid onboarding / badge updates. */
export function getMelbourneOnboardingVenues(): Venue[] {
  return queryDirectoryVenues({ city: "melbourne" }).sort((a, b) => {
    if (Boolean(a.isCbd) !== Boolean(b.isCbd)) return a.isCbd ? -1 : 1;
    return resolveActiveRosterCount(b) - resolveActiveRosterCount(a);
  });
}

/** Map a seed record into the directory Venue shape (city id = melbourne). */
export function seedVenueToDirectoryVenue(
  seed: SeedVenueRecord,
  index = 0,
): Venue {
  const pricing = resolveVenuePricing({
    pricing: seedPricingRows(seed.pricing),
    profile: {
      pricing: seedPricingRows(seed.pricing),
    } as VenueOperationalProfile,
  });
  const rateLine = formatPricingRateLine(pricing);
  const isEnterprise = seed.tier === "enterprise";
  const isVerifiedElite =
    seed.badgeStatus === "verified_elite" ||
    seed.tier === "verified_elite" ||
    (seed.isVerified && (seed.tier === "managed_vip" || isEnterprise));
  const isVip =
    seed.tier === "managed_vip" ||
    seed.tier === "verified_elite" ||
    seed.badgeStatus === "managed_vip" ||
    seed.badgeStatus === "verified_elite" ||
    isEnterprise;
  const coords = SEED_COORDS[seed.id];
  const amenities = amenitiesFromTags(seed.tags);
  const listingTier = isEnterprise
    ? ("enterprise" as const)
    : isVip
      ? ("vip" as const)
      : ("free" as const);
  const messaging: VenueMessagingHandles = {
    phone: seed.messaging?.phone || seed.phone,
    whatsapp:
      seed.messaging?.whatsapp || seed.phone.replace(/[^\d+]/g, ""),
    wechat: seed.messaging?.wechat || seed.id.replace(/-/g, ""),
    telegram: seed.messaging?.telegram || null,
  };
  const badgeStatus: VenueBadgeStatus =
    seed.badgeStatus ||
    (isEnterprise
      ? "enterprise"
      : isVerifiedElite
        ? "verified_elite"
        : isVip
          ? "managed_vip"
          : "basic");
  const ladies = seed.ladies;
  const activeRosterCount = resolveActiveRosterCount({ ladies });

  return withDirectorySchema({
    id: seed.id,
    name: seed.name,
    city: normalizeSeedCity(seed),
    suburb: seed.suburb,
    category: normalizeSeedCategory(seed.category),
    description: seed.description,
    image: SEED_IMAGES[index % SEED_IMAGES.length],
    tags: Array.from(
      new Set([
        ...seed.tags,
        "Cash OK",
        "EFTPOS",
        "WeChat Pay",
        "Alipay",
        ...amenities,
      ]),
    ),
    // English-only Melbourne listings for EN/ZH patrons.
    nameZh: undefined,
    descriptionZh: undefined,
    suburbZh: undefined,
    tagsZh: undefined,
    ladies,
    phone: seed.phone,
    address: seed.address,
    lat: coords?.lat,
    lng: coords?.lng,
    isCbd: seed.isCbd,
    website: seed.website,
    verified: seed.isVerified,
    fictional: false,
    hours: seed.tags.some((tag) => /24\/?7/i.test(tag))
      ? "Open 24 Hours"
      : "Daily 10am–late",
    pricing,
    rateLine,
    isManaged: isVip,
    managedBadge: isVip ? "vip" : undefined,
    badgeStatus,
    activeRosterCount,
    messaging,
    customHighlights: isVip
      ? {
          tier: listingTier,
          managedBadge: "vip",
          wechat: messaging.wechat,
          whatsapp: messaging.whatsapp,
          telegram: messaging.telegram,
          hook: {
            title: seed.description.split(".")[0],
            subtitle: isEnterprise
              ? "Enterprise Ultimate · dedicated concierge booking"
              : "Managed VIP Elite · instant course booking",
          },
        }
      : {
          tier: "free",
        },
    profile: {
      tierLabel: isEnterprise
        ? "Enterprise Ultimate"
        : isVip
          ? "VIP Suite"
          : "Basic",
      pricing,
      // Cast: Melbourne uses English payment labels (no CJK suffixes).
      payments: MELBOURNE_PAYMENTS as VenuePaymentChip[],
      amenities,
      services: ["GFE", "Massage", "Oral"],
      rateLine,
    },
  });
}

/** Melbourne directory venues derived from `melbourneVenues` (SSOT for feed + fallback). */
export const MELBOURNE_VERIFIED_VENUES: Venue[] = (melbourneVenues || []).map(
  (seed, index) => seedVenueToDirectoryVenue(seed, index),
);

/** Unified Sydney + Melbourne catalog for the home feed. */
export const venues: Venue[] = [
  ...(Array.isArray(sydneyVenues) ? sydneyVenues : []),
  ...(Array.isArray(MELBOURNE_VERIFIED_VENUES) ? MELBOURNE_VERIFIED_VENUES : []),
];

/** Full Sydney + Melbourne seed catalog (safe for HomeFeed / page fallbacks). */
export function getSeedDirectoryVenues(): Venue[] {
  try {
    const catalog =
      Array.isArray(venues) && venues.length > 0
        ? venues
        : [
            ...(Array.isArray(sydneyVenues) ? sydneyVenues : []),
            ...(Array.isArray(MELBOURNE_VERIFIED_VENUES)
              ? MELBOURNE_VERIFIED_VENUES
              : []),
          ];
    return attachPricingToVenues(catalog).map(withDirectorySchema);
  } catch (error) {
    console.error("[getSeedDirectoryVenues] fallback", error);
    return (Array.isArray(venues) ? venues : []).map(withDirectorySchema);
  }
}

/** Minimum AUD course price from the shared pricing ladder. */
export function minimumCoursePrice(pricing: VenuePriceRow[]): string | null {
  const ladder = [...pricing].sort((a, b) => {
    const mins = (row: VenuePriceRow) => {
      const n = Number.parseInt(row.duration, 10);
      if (/hr|hour/i.test(row.duration)) return (n || 1) * 60;
      return n || 0;
    };
    return mins(a) - mins(b);
  });
  return ladder[0]?.price || null;
}

function asOperationalProfile(
  venue: Venue,
  pricing: VenuePriceRow[],
  rateLine: string,
): VenueOperationalProfile {
  const base = buildVenueOperationalProfile(venue);
  return {
    ...base,
    ...(venue.profile?.payments
      ? { payments: venue.profile.payments as VenueOperationalProfile["payments"] }
      : {}),
    ...(venue.profile?.amenities
      ? {
          amenities: venue.profile
            .amenities as VenueOperationalProfile["amenities"],
        }
      : {}),
    ...(venue.profile?.services
      ? { services: venue.profile.services as VenueOperationalProfile["services"] }
      : {}),
    pricing,
    rateLine,
  };
}

/**
 * Attach `pricing` + `rateLine` onto a venue from the same ladder the
 * detail Rates cards use — never a separate hardcoded banner string.
 */
export function withVenuePricing<T extends Venue>(venue: T): T {
  if (venue.pricing && venue.pricing.length >= 2) {
    const pricing = resolveVenuePricing({
      pricing: venue.pricing,
      profile: asOperationalProfile(venue, venue.pricing, venue.rateLine || ""),
    });
    const rateLine = formatPricingRateLine(pricing);
    return {
      ...venue,
      pricing,
      rateLine,
      profile: asOperationalProfile(venue, pricing, rateLine),
    };
  }

  const content = syncContentPricing(
    parseVenueContent({
      description: venue.description,
      tags: venue.tags,
      venueId: venue.id,
      category: venue.category,
      city: venue.city,
      suburb: venue.suburb,
      isCbd: venue.isCbd,
    }),
  );

  return {
    ...venue,
    pricing: content.pricing,
    rateLine: content.profile.rateLine,
    profile: content.profile,
  };
}

export function attachPricingToVenues<T extends Venue>(venues: T[]): T[] {
  return venues.map((venue) => withVenuePricing(venue));
}

/**
 * High-res masked female portraits with non-repetitive fallbacks.
 * Prefer ethnicity pool, then any unused curated staff path, never interiors.
 */
export function nextMaskedStaffPortrait(options: {
  ethnicity?: string | null;
  seed: string;
  offset?: number;
  used?: Set<string>;
}): string {
  const used = options.used || new Set<string>();
  const primary = portraitForEthnicity(
    options.ethnicity,
    options.seed,
    options.offset || 0,
    used,
  );
  if (isTrustedStaffPortrait(primary) && used.has(primary)) {
    return primary;
  }

  // Cross-bucket unused fallback so long rosters stay unique.
  for (let step = 0; step < STAFF_PORTRAIT_FALLBACKS.length; step += 1) {
    const candidate =
      STAFF_PORTRAIT_FALLBACKS[
        (hashSeed(options.seed) + (options.offset || 0) + step * 5) %
          STAFF_PORTRAIT_FALLBACKS.length
      ];
    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }

  used.add(primary);
  return primary;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Melbourne CBD / King · Little Bourke · Flinders · Southbank priority (0 = top). */
export function melbourneCbdPriority(
  venue: Pick<Venue, "city" | "suburb" | "address" | "tags" | "isCbd">,
): number {
  if (venue.city !== "melbourne") return 50;
  const hay = `${venue.suburb} ${venue.address} ${(venue.tags || []).join(" ")}`.toLowerCase();
  if (
    /king\s*st|little\s*bourke|flinders(\s*st|\s*street| lane)?|swanston|southbank|melbourne\s*cbd|\bcbd\b/.test(
      hay,
    )
  ) {
    return 0;
  }
  if (
    venue.isCbd ||
    /melbourne|docklands|carlton|east melbourne|south melbourne|collingwood/.test(
      hay,
    )
  ) {
    return 1;
  }
  return 2;
}
