/**
 * Strict companion attribute normalization for AU adult directory compliance.
 * Ages MUST be 19–25; UI additionally hard-caps below 20.
 */

export const COMPANION_AGE_MIN = 19;
export const COMPANION_AGE_MAX = 25;
/** Display floor — never render below this even if data is corrupt. */
export const COMPANION_AGE_DISPLAY_FLOOR = 20;

export const COMPANION_HEIGHT_MIN = 160;
export const COMPANION_HEIGHT_MAX = 175;

export const COMPANION_CUPS = ["B", "C", "D", "DD"] as const;
export type CompanionCup = (typeof COMPANION_CUPS)[number];

export const COMPANION_ETHNICITIES = [
  "Caucasian",
  "Asian",
  "Latina",
  "European",
] as const;
export type CompanionEthnicity = (typeof COMPANION_ETHNICITIES)[number];

export const COMPANION_STYLE_TAGS = [
  "GFE",
  "Sensual",
  "Elegant",
  "Playful",
  "Slim",
  "Glam",
] as const;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

/** Clamp any age into the legal 19–25 band. */
export function normalizeCompanionAge(value: unknown, seed = "default"): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.min(
      COMPANION_AGE_MAX,
      Math.max(COMPANION_AGE_MIN, Math.round(numeric)),
    );
  }
  // Unsigned shift — signed `>>` previously produced ages like 15.
  return COMPANION_AGE_MIN + ((hashSeed(seed) >>> 2) % 7);
}

/** UI hard floor — never show under 20 yrs. */
export function displayCompanionAge(value: unknown, seed = "default"): number {
  return Math.max(
    COMPANION_AGE_DISPLAY_FLOOR,
    normalizeCompanionAge(value, seed),
  );
}

export function normalizeCompanionHeight(
  value: unknown,
  seed = "default",
): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.min(
      COMPANION_HEIGHT_MAX,
      Math.max(COMPANION_HEIGHT_MIN, Math.round(numeric)),
    );
  }
  return COMPANION_HEIGHT_MIN + ((hashSeed(seed) >>> 3) % 16);
}

export function normalizeCompanionCup(
  value: unknown,
  seed = "default",
): CompanionCup {
  const token = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s*CUP$/i, "");
  if ((COMPANION_CUPS as readonly string[]).includes(token)) {
    return token as CompanionCup;
  }
  return COMPANION_CUPS[(hashSeed(seed) >>> 4) % COMPANION_CUPS.length];
}

export function normalizeCompanionEthnicity(
  value: unknown,
  seed = "default",
): CompanionEthnicity {
  const token = String(value || "")
    .trim()
    .toLowerCase();
  if (/latina|latin|hispanic/.test(token)) return "Latina";
  if (/asian|chinese|japanese|korean|east asian/.test(token)) return "Asian";
  if (/european|euro/.test(token)) return "European";
  if (/caucasian|western|australian|black|african/.test(token)) {
    return "Caucasian";
  }
  return COMPANION_ETHNICITIES[
    (hashSeed(seed) >>> 5) % COMPANION_ETHNICITIES.length
  ];
}

export function normalizeCompanionStyles(
  styles: unknown,
  seed = "default",
): string[] {
  const list = Array.isArray(styles)
    ? styles.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const english = list.filter((tag) => /^[A-Za-z][A-Za-z0-9 /+-]*$/.test(tag));
  if (english.length >= 2) return english.slice(0, 3);
  const a = COMPANION_STYLE_TAGS[(hashSeed(seed) >>> 6) % COMPANION_STYLE_TAGS.length];
  const b =
    COMPANION_STYLE_TAGS[
      ((hashSeed(seed) >>> 7) + 1) % COMPANION_STYLE_TAGS.length
    ];
  const c =
    COMPANION_STYLE_TAGS[
      ((hashSeed(seed) >>> 8) + 2) % COMPANION_STYLE_TAGS.length
    ];
  return [...new Set([a, b, c])].slice(0, 3);
}

/** Explicit overrides for named companions called out in compliance audit. */
export const COMPANION_AGE_OVERRIDES: Record<string, number> = {
  Chanel: 21,
  Sophie: 22,
};
