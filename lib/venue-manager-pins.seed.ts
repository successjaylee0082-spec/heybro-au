/**
 * Server-only seed fallback for venue manager PINs when Supabase is offline.
 * Source of truth after migration apply: public.venues.manager_pin.
 * Master admin PIN "8899" is never listed here.
 */
export const SEED_VENUE_MANAGER_PINS: Record<string, string> = {
  "57-burwood-brothel": "5128",
  "a-touch-more-class-formerly-a-touch-of-class": "3508",
  "adelaide-laneway-massage": "2069",
  "casablanca-gentlemans-club": "7895",
  "cleopatras-gentlemans-club": "0428",
  "coast-tide-retail": "2331",
  "cross-stage-club": "6302",
  "cuties-escorts": "8413",
  "dream-girl-130": "3557",
  "five-star-moon": "0423",
  "fortitude-pulse": "9644",
  "ginza-club": "2876",
  "harbour-glow-lounge": "2240",
  "jk80-gentlemen-club": "2540",
  liaisons: "5682",
  "maggies-girls-sydney": "6372",
  "melb-1": "8014",
  "melb-2": "8015",
  "melb-3": "8016",
  "melb-4": "8017",
  "melb-5": "8018",
  mistiques: "2404",
  "my-girls-sydney": "1981",
  "perth-ember-room": "3509",
  "pink-house": "2099",
  "surry-neon-room": "7388",
  "sweet-babe-181": "1174",
  "sydney-asian-brothels": "1589",
  "sydney-empress-69": "1684",
  "the-nightshade": "0077",
  tiffanys: "4724",
  "wives-only": "8989",
};
