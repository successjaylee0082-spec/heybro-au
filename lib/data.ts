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
import type { CategoryId, CityId, Venue } from "@/types";

export type { VenuePriceRow };
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
  tier: "managed_vip" | "standard" | string;
  isVerified: boolean;
  tags: string[];
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
    fictional: true,
    isManaged: true,
    managedBadge: "vip",
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
    fictional: true,
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
    customHighlights: { tier: "free" },
    hours: "Fri–Sat 9pm–3am",
  },
  {
    id: "cleopatras-gentlemans-club",
    name: "Cleopatra's Gentleman's Club",
    city: "sydney",
    suburb: "Wetherill Park",
    category: "brothels",
    description: "12 HARGRAVES PL, WETHERILL PARK NSW WWW.CLEOPATRASGENTLEMANSCLUB.COM.AU (02) 9609 6668 Award-winning Cleopatra’s Gentleman’s Club (BEST BROTHEL NSW – Austral…",
    image: "/images/directory/04.jpg",
    tags: ["Discreet Parking","Discreet Entrance","Meet and Greet Room"],
    phone: "(02) 9609 6668",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    fictional: false,
    website: "https://www.cleopatrasgentlemansclub.com.au/",
    hours: "Monday - Sunday 10am ‐ 5am",
    isManaged: true,
    managedBadge: "vip",
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
    description: "SYDNEY NSW, AUSTRALIA WWW.MYGIRLS.COM.AU (02) 9356 9569 Looking for the ultimate Sydney escort for an event or an incredible lady for a delightful one-on-one…",
    image: "/images/directory/05.jpg",
    tags: ["Open 24 Hours"],
    phone: "(02) 9356 9569",
    address: "50 Kellett St, Potts Point NSW 2011",
    lat: -33.871,
    lng: 151.225,
    isCbd: true,
    distanceFromCbdKm: 1.5,
    verified: true,
    fictional: false,
    website: "https://www.mygirls.com.au/",
    hours: "Monday to Sunday 12am ‐ 12pm",
    isManaged: true,
    managedBadge: "vip",
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
    description: "15 BLAXLAND ROAD, CAMPBELLTOWN NSW WWW.CUTIESESCORTS.COM.AU 1300 288 437 Cuties Escorts Banksia, Campbelltown, Liverpool and Narellan Cuties Escorts is the p…",
    image: "/images/directory/06.jpg",
    tags: ["Open 24 Hours","Discreet Parking","Discreet Entrance"],
    phone: "1300 288 437",
    address: "15 BLAXLAND ROAD, CAMPBELLTOWN NSW",
    lat: -34.065,
    lng: 150.814,
    isCbd: false,
    distanceFromCbdKm: 42.5,
    verified: true,
    fictional: false,
    website: "https://www.cutiesescorts.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
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
    description: "130 BOTANY RD, ALEXANDRIA NSW WWW.MASSAGECBD.COM 0426 030 130 Welcome to Dream Girl 130, 7 min from Redfern or Green Square Stations, 5 min drive from Sydney…",
    image: "/images/directory/07.jpg",
    tags: ["Discreet Parking","Essentials Provided"],
    phone: "0426 030 130",
    address: "130 BOTANY RD, ALEXANDRIA NSW",
    lat: -33.901,
    lng: 151.193,
    isCbd: false,
    distanceFromCbdKm: 3.9,
    verified: true,
    fictional: false,
    website: "http://www.massagecbd.com/",
    hours: "Monday-Sunday 10AM ‐ 8PM; (last booking at 8pm) ‐",
    isManaged: false,
    managedBadge: undefined,
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
    description: "LEVEL 1, 69 LIVERPOOL ST, HAYMARKET NSW (corner of Liverpool St and Kent St) WWW.MASSAGECBD.COM.AU 0451 079 669 Welcome to Sydney Empress 69 – the hottest, b…",
    image: "/images/directory/08.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "0451 079 669",
    address: "LEVEL 1, 69 LIVERPOOL ST, HAYMARKET NSW (corner of Liverpool St and Kent St)",
    lat: -33.879,
    lng: 151.205,
    isCbd: true,
    distanceFromCbdKm: 1.2,
    verified: true,
    fictional: false,
    website: "http://www.massagecbd.com.au/",
    hours: "Every Day 10 am ‐ 8 pm",
    isManaged: false,
    managedBadge: undefined,
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
    description: "Tiffany’s is an established brothel with over 45 years experience and has a well-earned reputation as one of Sydney’s best-known brothels. Whether you are ex…",
    image: "/images/directory/09.jpg",
    tags: ["Complimentary Drinks and Snacks","Discreet Entrance","Meet and Greet Room"],
    phone: "(02) 9212 1195",
    address: "99 Albion St, Surry Hills NSW",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    fictional: false,
    website: "http://www.tiffanysgirls.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
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
    description: "Experience the intimacy of a true girlfriend experience (GFE). All the wonderful ladies here provide a genuine, intimate, unrushed encounter, which includes …",
    image: "/images/directory/10.jpg",
    tags: ["Discreet Entrance","Meet and Greet Room","Jacuzzi and Spa"],
    phone: "(02) 9212 4455",
    address: "377 Riley St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    fictional: false,
    website: "https://www.atouchofclass.net.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
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
    description: "Welcome to Sydney’s premier Asian Bordello. Our approved venue has been renovated with your comfort and pleasure in mind. The luxuriously appointed themed ro…",
    image: "/images/directory/11.jpg",
    tags: ["Meet and Greet Room","Jacuzzi and Spa"],
    phone: "02 7901 3000",
    address: "310 Cleveland St, Surry Hills NSW 2010",
    lat: -33.884,
    lng: 151.212,
    isCbd: true,
    distanceFromCbdKm: 1.7,
    verified: true,
    fictional: false,
    website: "http://ginzaclub.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
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
    description: "EDGECLIFF, SYDNEY NSW WWW.LIAISONS.COM.AU (02) 9363 02500 Liaisons Sydney brothel has long held a reputation as the city’s best bordello, located only minute…",
    image: "/images/directory/12.jpg",
    tags: ["Open 24 Hours","Complimentary Drinks and Snacks","Essentials Provided"],
    phone: "0488 551 025",
    address: "535 Glenmore Road, Edgecliff NSW 2027",
    lat: -33.879,
    lng: 151.237,
    isCbd: false,
    distanceFromCbdKm: 2.8,
    verified: true,
    fictional: false,
    website: "https://www.liaisons.com.au/",
    hours: undefined,
    isManaged: true,
    managedBadge: "vip",
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
    description: "673 KING ST, ST PETERS NSW WWW.WIVESONLY.COM.AU (02) 9519 6756 Conveniently located in the city fringe suburb of St. Peters, Wives Only is a high-class Sydne…",
    image: "/images/directory/13.jpg",
    tags: ["Discreet Entrance","Meet and Greet Room","Essentials Provided"],
    phone: "(02) 9519 6756",
    address: "673 King St, St Peters NSW 2044",
    lat: -33.911,
    lng: 151.181,
    isCbd: false,
    distanceFromCbdKm: 5.4,
    verified: true,
    fictional: false,
    website: "http://www.wivesonly.com.au/",
    hours: "Sunday 11am ‐ 2am; Monday 11am ‐ 3am; Tuesday 11am ‐ 3am; Wednesday 11am ‐ 3am; Thursday 11am ‐ 3am; Friday 11pm ‐ 5am; Saturday 11pm ‐ 5am",
    isManaged: false,
    managedBadge: undefined,
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
    description: "The ladies at Asian Brothels Sydney hail from many different Asian countries; hand-picked for their sex appeal and grace. Whether you are craving Chinese, Ja…",
    image: "/images/directory/14.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    fictional: false,
    website: undefined,
    hours: undefined,
    isManaged: false,
    managedBadge: undefined,
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
    description: "20-22 KELLETT ST, POTTS POINT, NSW 2011 WWW.MAGGIESGIRLSSYDNEY.COM.AU 0475 630 753 Maggie’s Girls Sydney, previously known as Maggie’s Girls, is an iconic Si…",
    image: "/images/directory/15.jpg",
    tags: ["Discreet Parking","Discreet Entrance","Essentials Provided"],
    phone: "0475 630 753",
    address: "12 Hargraves Pl, Wetherill Park NSW 2164",
    lat: -33.846,
    lng: 150.906,
    isCbd: false,
    distanceFromCbdKm: 28.1,
    verified: true,
    fictional: false,
    website: "https://www.maggiesgirlssydney.com.au/",
    hours: "Every Day 12.30 PM ‐ 6 AM",
    isManaged: false,
    managedBadge: undefined,
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
    description: "12 NORFOLK ROAD, GREEN ACRE, NSW WWW.GREENACREBROTHEL.COM.AU 0451 512 012 Pink House Brothel & Adult Entertainment Club located in Greenacre is an establishe…",
    image: "/images/directory/16.jpg",
    tags: ["Discreet Parking"],
    phone: "0451 512 012",
    address: "12 Norfolk Rd, Greenacre NSW 2190",
    lat: -33.905,
    lng: 151.058,
    isCbd: false,
    distanceFromCbdKm: 14.5,
    verified: true,
    fictional: false,
    website: "https://www.greenacrebrothel.com.au/",
    hours: "Open 7 Days 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
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
    description: "2/42 BUFFALO ROAD, GLADESVILLE NSW 2111 WWW.THENIGHTSHADE.COM.AU 0498 100 011 The Nightshade has the biggest selection of mixed nationalities escorts in all …",
    image: "/images/directory/17.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "0498 100 011",
    address: "2/42 Buffalo Road, Gladesville NSW 2111",
    lat: -33.833,
    lng: 151.125,
    isCbd: false,
    distanceFromCbdKm: 8.7,
    verified: true,
    fictional: false,
    website: "https://thenightshade.com.au/",
    hours: "Every Day 10 AM ‐ Til Late",
    isManaged: false,
    managedBadge: undefined,
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
    description: "1/181 MCCREDIE ROAD, SMITHFIELD NSW 2164 WWW.SWEETBABE181.COM.AU (02) 9681 3698 Indulge in your every desire at Sweet Babe 181 – a luxurious brothel located …",
    image: "/images/directory/18.jpg",
    tags: ["Discreet Parking","Discreet Entrance"],
    phone: "(02) 9681 3698",
    address: "1/181 McCredie Road, Smithfield NSW 2164",
    lat: -33.85,
    lng: 150.94,
    isCbd: false,
    distanceFromCbdKm: 25,
    verified: true,
    fictional: false,
    website: "https://sweetbabe181.com.au/",
    hours: "Monday 10 AM ‐ 2 AM; Tuesday 10 AM ‐ 2 AM; Wednesday 10 AM ‐ 2 AM; Thursday 10 AM ‐ 2 AM; Friday 10 AM ‐ 5 AM; Saturday 10 AM ‐ 6 AM; Sunday 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
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
    description: "Casablanca Brothel Liverpool (Casablanca 239) Casablanca is one of Sydney’s finest “gentleman clubs” in south-west Sydney and considered one of best Sydney b…",
    image: "/images/directory/19.jpg",
    tags: ["Discreet Parking","Discreet Entrance","Essentials Provided"],
    phone: "(02) 9822 4830",
    address: "239 Northumberland St, Liverpool NSW 2170",
    lat: -33.925,
    lng: 150.924,
    isCbd: false,
    distanceFromCbdKm: 27.1,
    verified: true,
    fictional: false,
    website: undefined,
    hours: "Monday to Wednesday Noon ‐ 2am; Thursday Noon ‐ 3am; Friday to Saturday Noon ‐ 5am; Sunday 4pm ‐ 2am",
    isManaged: false,
    managedBadge: undefined,
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
    description: "Mistiques Newtown offers an elegant and sophisticated setting for guests seeking a private and indulgent experience in Sydney. The venue features nine beauti…",
    image: "/images/directory/20.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "70 Enmore Road, Newtown NSW 2042",
    lat: -33.898,
    lng: 151.179,
    isCbd: false,
    distanceFromCbdKm: 4.3,
    verified: true,
    fictional: false,
    website: undefined,
    hours: "Every Day 10 AM ‐ Til Late",
    isManaged: false,
    managedBadge: undefined,
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
    description: "Five Star Moon (also known as 87 Auburn Brothel) is a gentlemen’s club located in Auburn, Sydney, offering a private and discreet adult entertainment experie…",
    image: "/images/directory/21.jpg",
    tags: ["Open 24 Hours","Discreet Parking","Discreet Entrance"],
    phone: "(02) 9609 6668",
    address: "87 Rawson St, Auburn NSW 2144",
    lat: -33.849,
    lng: 151.033,
    isCbd: false,
    distanceFromCbdKm: 16.4,
    verified: true,
    fictional: false,
    website: undefined,
    hours: "Every Day 12 AM ‐ 12 AM",
    isManaged: false,
    managedBadge: undefined,
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
    description: "JK80 Gentlemen Club is a modern adult entertainment and erotic massage parlour in Sydney CBD, conveniently located on Erskine Street. Open seven days a week …",
    image: "/images/directory/22.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "80 Erskine St, Sydney NSW 2000",
    lat: -33.8688,
    lng: 151.2093,
    isCbd: true,
    distanceFromCbdKm: 0,
    verified: true,
    fictional: false,
    website: undefined,
    hours: "Monday to Friday 10 AM ‐ 4 AM; Saturday 12 PM ‐ 4 AM; Sunday 10 AM ‐ 2 AM",
    isManaged: false,
    managedBadge: undefined,
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
    description: "57 Burwood Brothel is known locally as one of the best Asian brothels in the Inner West Sydney. With roughly 20 young and hot Asian companions at their estab…",
    image: "/images/directory/23.jpg",
    tags: ["Cash OK","EFTPOS"],
    phone: "(02) 9609 6668",
    address: "57 George St, Burwood NSW 2134",
    lat: -33.877,
    lng: 151.104,
    isCbd: false,
    distanceFromCbdKm: 9.8,
    verified: true,
    fictional: false,
    website: undefined,
    hours: "Monday to Wednesday 10.30 AM ‐ 3 AM; Thursday 10.30 AM ‐ 3.30 AM; Friday to Saturday 10.30 AM ‐ 4 AM; Sunday 10.30 AM ‐ 3 AM",
    isManaged: false,
    managedBadge: undefined,
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
      "World-class luxury brothel and 24/7 escort agency located conveniently near the Melbourne CBD, offering premier in-call and out-call experiences.",
    pricing: [
      { duration: "30m", price: 160 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 250 },
    ],
    tier: "managed_vip",
    isVerified: true,
    tags: ["CBD First", "Cash OK", "EFTPOS", "24/7 Available"],
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
      "Premier adult entertainment venue situated near Crown Casino featuring an extensive selection of gorgeous companions and high-end discrete service.",
    pricing: [
      { duration: "30m", price: 170 },
      { duration: "45m", price: 210 },
      { duration: "60m", price: 260 },
    ],
    tier: "managed_vip",
    isVerified: true,
    tags: ["CBD First", "WeChat Pay", "Discrete Entrance", "Premium VIP"],
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
      "Multi-million dollar luxury bordello complex in South Melbourne, renowned for opulence, stunning companions, and top-tier service.",
    pricing: [
      { duration: "30m", price: 180 },
      { duration: "45m", price: 220 },
      { duration: "60m", price: 280 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "Private Shower", "Luxury Complex"],
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
      "First-class adult entertainment venue only 5 minutes from the CBD, proudly female-operated since 1997 with a focus on privacy and respect.",
    pricing: [
      { duration: "30m", price: 150 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 240 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["Cash OK", "Female Operated", "Discreet"],
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
      "Six-star gentlemen club featuring elegant marble interiors, a sophisticated atmosphere, and refined companion services.",
    pricing: [
      { duration: "30m", price: 160 },
      { duration: "45m", price: 200 },
      { duration: "60m", price: 250 },
    ],
    tier: "standard",
    isVerified: true,
    tags: ["EFTPOS", "VIP Lounge", "Six-Star"],
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
  const isVip = seed.tier === "managed_vip";
  const coords = SEED_COORDS[seed.id];
  const amenities = amenitiesFromTags(seed.tags);
  return {
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
    // English-only Melbourne listings — no ko/zh display fields.
    nameZh: undefined,
    descriptionZh: undefined,
    suburbZh: undefined,
    tagsZh: undefined,
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
    customHighlights: isVip
      ? {
          tier: "vip",
          managedBadge: "vip",
          wechat: seed.id.replace(/-/g, ""),
          whatsapp: seed.phone.replace(/[^\d+]/g, ""),
        }
      : {
          tier: "free",
        },
    profile: {
      tierLabel: isVip ? "VIP Suite" : "Standard",
      pricing,
      // Cast: Melbourne uses English payment labels (no CJK suffixes).
      payments: MELBOURNE_PAYMENTS as VenuePaymentChip[],
      amenities,
      services: ["GFE", "Massage", "Oral"],
      rateLine,
    },
  };
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
    return attachPricingToVenues(catalog);
  } catch (error) {
    console.error("[getSeedDirectoryVenues] fallback", error);
    return Array.isArray(venues) ? venues : [];
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
