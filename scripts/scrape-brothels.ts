/**
 * Respectful scraper for public Sydney listings on brothels.com.au.
 *
 * Defaults:
 * - writes JSON only (no database writes)
 * - incremental: skips URLs/IDs already in the data file or Supabase
 * - random 2s–3.5s delay between detail fetches
 * - retries network / 403 / 429 up to 3 times (404 is not retried)
 *
 * Usage:
 *   pnpm scrape
 *   pnpm scrape -- --limit=10
 *   pnpm scrape -- --full          # ignore incremental skip set
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import { chromium, type Page } from "@playwright/test";
import type { ScrapedStaffMember, ScrapedVenue } from "../types/scraped-venue";
import {
  absoluteUrl,
  browserHeaders,
  canonicalSourceUrl,
  cleanText,
  isLikelyStaffImage,
  normalizePhone,
  parseAustralianAddress,
  sleep,
  sleepRandom,
  slugFromSourceUrl,
  sourceIdFromUrl,
  userAgent,
} from "./lib/scrape-utils";

const DETAIL_DELAY_MIN_MS = 2000;
const DETAIL_DELAY_MAX_MS = 3500;
const DETAIL_MAX_ATTEMPTS = 3;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LISTING_URL = "https://brothels.com.au/brothels-in-sydney/";
const OUT_FILE = join(ROOT, "data/scraped/sydney-brothels.json");

type ListingCard = {
  name: string;
  sourceUrl: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  blurb: string | null;
  coverImageUrl: string | null;
};

type ScrapedFile = {
  scrapedAt: string;
  sourceListingUrl: string;
  count: number;
  errors?: Array<{ url: string; error: string }>;
  venues: ScrapedVenue[];
};

class HttpStatusError extends Error {
  status: number;
  retryable: boolean;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.retryable = status === 403 || status === 429 || status >= 500;
  }
}

function argValue(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function identityKeysForVenue(venue: {
  sourceUrl?: string | null;
  source_url?: string | null;
  sourceId?: string | null;
  source_id?: string | null;
  slug?: string | null;
}): string[] {
  const keys: string[] = [];
  const sourceUrl = venue.sourceUrl || venue.source_url;
  const sourceId = venue.sourceId || venue.source_id;
  if (sourceUrl) keys.push(`url:${canonicalSourceUrl(sourceUrl)}`);
  if (sourceId) keys.push(`id:${String(sourceId)}`);
  if (venue.slug) keys.push(`slug:${venue.slug}`);
  return keys;
}

function identityKeysForCard(card: ListingCard): string[] {
  const sourceUrl = absoluteUrl(card.sourceUrl);
  const sourceId = sourceIdFromUrl(sourceUrl);
  const slug = slugFromSourceUrl(sourceUrl, card.name || "venue");
  return identityKeysForVenue({ sourceUrl, sourceId, slug });
}

function loadExistingFile(path: string): ScrapedFile | null {
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as ScrapedFile;
    if (!Array.isArray(parsed.venues)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function loadKnownKeysFromSupabase(): Promise<Set<string>> {
  const keys = new Set<string>();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return keys;

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from("venues")
      .select("slug, source_url, source_id")
      .eq("city", "sydney")
      .eq("category", "brothels");
    if (error) {
      console.warn(`Supabase skip-set unavailable: ${error.message}`);
      return keys;
    }
    for (const row of data || []) {
      for (const keyName of identityKeysForVenue(row)) keys.add(keyName);
    }
    console.log(`Loaded ${keys.size} known keys from Supabase`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Supabase skip-set lookup failed: ${message}`);
  }
  return keys;
}

function buildKnownKeySet(existing: ScrapedFile | null, dbKeys: Set<string>): Set<string> {
  const keys = new Set<string>(dbKeys);
  for (const venue of existing?.venues || []) {
    for (const key of identityKeysForVenue(venue)) keys.add(key);
  }
  return keys;
}

function isAlreadyKnown(card: ListingCard, known: Set<string>): boolean {
  return identityKeysForCard(card).some((key) => known.has(key));
}

async function assertRobotsAllows(pathname: string): Promise<void> {
  const { data } = await axios.get<string>("https://brothels.com.au/robots.txt", {
    headers: browserHeaders(),
    timeout: 15000,
    responseType: "text",
    validateStatus: (status) => status >= 200 && status < 400,
  });
  const lines = data.split(/\r?\n/);
  let inStar = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (/^user-agent$/i.test(key)) {
      inStar = value === "*";
      continue;
    }
    if (!inStar) continue;
    if (/^disallow$/i.test(key) && value && pathname.startsWith(value)) {
      throw new Error(`robots.txt Disallow matches ${pathname}: ${value}`);
    }
  }
}

async function collectListingCards(page: Page): Promise<ListingCard[]> {
  await page.goto(LISTING_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".product-card.shop-item", { timeout: 45000 });
  await sleep(2500);

  return page.$$eval(".product-card.shop-item", (nodes) =>
    nodes.map((node) => {
      const info = node.querySelector(".item-info") || node;
      const titleAnchor =
        info.querySelector<HTMLAnchorElement>("p.item-info-title a") ||
        info.querySelector<HTMLAnchorElement>("a");
      const name = (titleAnchor?.textContent || "").trim();
      const sourceUrl = titleAnchor?.href || "";
      const phone =
        info
          .querySelector<HTMLAnchorElement>("a.bd_brothel_tracking_number")
          ?.getAttribute("data-number") ||
        info.querySelector<HTMLAnchorElement>("a[href^='tel:']")?.textContent?.trim() ||
        null;
      const address =
        info.querySelector(".city-brothel-address")?.textContent?.trim() || null;
      const website =
        info.querySelector<HTMLAnchorElement>(".city-brothel-website a")?.href ||
        null;
      const blurb =
        [...info.querySelectorAll("p")]
          .map((p) => p.textContent?.trim() || "")
          .filter((text) => text && text !== name && text !== address)
          .sort((a, b) => b.length - a.length)[0] || null;
      const coverImageUrl =
        node.querySelector<HTMLImageElement>("img.shop-image, img")?.src || null;
      return { name, sourceUrl, phone, address, website, blurb, coverImageUrl };
    }),
  );
}

function parseDetailHtml(
  html: string,
  sourceUrl: string,
): {
  description: string | null;
  hours: string | null;
  services: string[];
  address: string | null;
  phone: string | null;
  website: string | null;
  staff: ScrapedStaffMember[];
  coverImageUrl: string | null;
} {
  const $ = cheerio.load(html);

  const description = cleanText(
    $(".brothel-description, .post-content p, .entry-content p")
      .first()
      .text(),
  );

  const services = $(
    ".brothel-feature-container, .brothel-features-container .brothel-feature-container",
  )
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter((value): value is string => Boolean(value));

  const hoursBits = $(".brothel-service-hours tr, .brothel-service-hours li")
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter((value): value is string => Boolean(value));
  const hours = hoursBits.length
    ? hoursBits.join("; ")
    : cleanText($(".brothel-service-hours").text()?.replace(/Opening Hours/i, ""));

  const containerText = cleanText($(".brothel-service-container").first().text()) || "";
  const streetMatch = containerText.match(
    /\d+[^,\n]*?(?:Road|Rd|Street|St|Place|Pl|Avenue|Ave|Drive|Dr|Lane|Ln|Parade|Pde|Boulevard|Blvd)[^,\n]*,\s*[^,\n]+NSW\s*\d{4}/i,
  );
  const address =
    cleanText(streetMatch?.[0]) ||
    cleanText($(".city-brothel-address").first().text()) ||
    cleanText(
      $(".brothel-service-address")
        .first()
        .text()
        .replace(/\s+/g, " "),
    );

  const phone =
    normalizePhone($("a.bd_brothel_tracking_number").attr("data-number")) ||
    normalizePhone($("a[href^='tel:']").first().attr("href")?.replace(/^tel:/i, "")) ||
    normalizePhone($(".brothel-service-phone").text());

  const website =
    $("a.city-brothel-website, .brothel-service-web a")
      .filter((_, el) => {
        const href = $(el).attr("href") || "";
        return /^https?:/i.test(href) && !/brothels\.com\.au/i.test(href);
      })
      .first()
      .attr("href") || null;

  const staff: ScrapedStaffMember[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt") || "";
    if (!src) return;
    const imageUrl = absoluteUrl(src, sourceUrl);
    if (!isLikelyStaffImage(imageUrl, alt)) return;
    staff.push({
      name: cleanText(alt),
      imageUrl,
      sourceUrl,
    });
  });

  const coverImageUrl =
    $("img.attachment-shop-single, .brothel-banner img, .nivoSlider img")
      .first()
      .attr("src") ||
    $("meta[property='og:image']").attr("content") ||
    null;

  return {
    description,
    hours: hours && hours !== "Share with your friends" ? hours : null,
    services: [...new Set(services)],
    address,
    phone,
    website: website ? absoluteUrl(website) : null,
    staff,
    coverImageUrl: coverImageUrl ? absoluteUrl(coverImageUrl, sourceUrl) : null,
  };
}

function isRetryableAxiosError(error: unknown): boolean {
  if (error instanceof HttpStatusError) return error.retryable;
  if (!(error instanceof AxiosError)) return false;
  if (!error.response) return true; // network / timeout
  const status = error.response.status;
  return status === 403 || status === 429 || status >= 500;
}

async function fetchDetailOnce(sourceUrl: string) {
  const { data, status } = await axios.get<string>(sourceUrl, {
    headers: browserHeaders({
      Referer: LISTING_URL,
    }),
    timeout: 30000,
    responseType: "text",
    maxRedirects: 5,
    validateStatus: () => true,
  });

  if (status === 404) {
    throw new HttpStatusError(404, `Detail fetch failed 404 for ${sourceUrl}`);
  }
  if (status === 403 || status === 429 || status >= 500) {
    throw new HttpStatusError(
      status,
      `Detail fetch failed ${status} for ${sourceUrl}`,
    );
  }
  if (status >= 400) {
    throw new HttpStatusError(status, `Detail fetch failed ${status} for ${sourceUrl}`);
  }
  return parseDetailHtml(data, sourceUrl);
}

async function fetchDetailWithRetry(
  sourceUrl: string,
  maxAttempts = DETAIL_MAX_ATTEMPTS,
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchDetailOnce(sourceUrl);
    } catch (error) {
      lastError = error;
      const retryable = isRetryableAxiosError(error);
      const status = error instanceof HttpStatusError ? error.status : undefined;
      if (!retryable || attempt >= maxAttempts) {
        throw error;
      }
      const backoff = 1000 * attempt + Math.floor(Math.random() * 500);
      console.log(
        `retry ${attempt}/${maxAttempts - 1} after ${status ?? "network"} (wait ${backoff}ms)`,
      );
      await sleep(backoff);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "Unknown detail fetch error"));
}

function toVenue(card: ListingCard, detail: ReturnType<typeof parseDetailHtml>): ScrapedVenue {
  const sourceUrl = absoluteUrl(card.sourceUrl);
  const address = detail.address || card.address;
  const parsed = parseAustralianAddress(address);
  const name = cleanText(card.name) || "Unknown venue";
  return {
    source: "brothels.com.au",
    sourceUrl,
    sourceId: sourceIdFromUrl(sourceUrl),
    slug: slugFromSourceUrl(sourceUrl, name),
    name,
    category: "brothels",
    city: "sydney",
    suburb: parsed.suburb,
    address,
    state: "NSW",
    postcode: parsed.postcode,
    phone: normalizePhone(detail.phone) || normalizePhone(card.phone),
    website: detail.website || (card.website && !/brothels\.com\.au/i.test(card.website)
      ? absoluteUrl(card.website)
      : null),
    hours: detail.hours,
    services: detail.services,
    description: detail.description || card.blurb,
    coverImageUrl: detail.coverImageUrl || card.coverImageUrl,
    staff: detail.staff,
    scrapedAt: new Date().toISOString(),
  };
}

function mergeVenues(
  existing: ScrapedVenue[],
  scraped: ScrapedVenue[],
): ScrapedVenue[] {
  const bySlug = new Map<string, ScrapedVenue>();
  for (const venue of existing) bySlug.set(venue.slug, venue);
  for (const venue of scraped) bySlug.set(venue.slug, venue);
  return [...bySlug.values()];
}

async function main() {
  const limit = Number(argValue("--limit") || process.env.SCRAPE_LIMIT || "0");
  const full = hasFlag("--full");
  await assertRobotsAllows("/brothels-in-sydney/");

  const existingFile = loadExistingFile(OUT_FILE);
  const dbKeys = full ? new Set<string>() : await loadKnownKeysFromSupabase();
  const known = full
    ? new Set<string>()
    : buildKnownKeySet(existingFile, dbKeys);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: userAgent(),
    extraHTTPHeaders: {
      "Accept-Language": "en-AU,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
  let cards: ListingCard[] = [];
  try {
    cards = await collectListingCards(page);
  } finally {
    await browser.close();
  }

  cards = cards.filter((card) => card.name && card.sourceUrl);

  let skipped = 0;
  if (!full) {
    const pending: ListingCard[] = [];
    for (const card of cards) {
      if (isAlreadyKnown(card, known)) {
        skipped += 1;
      } else {
        pending.push(card);
      }
    }
    cards = pending;
  }

  if (limit > 0) cards = cards.slice(0, limit);

  console.log(
    `Listing cards pending=${cards.length} skipped=${skipped} mode=${full ? "full" : "incremental"}`,
  );

  const scrapedVenues: ScrapedVenue[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  for (const [index, card] of cards.entries()) {
    const url = absoluteUrl(card.sourceUrl);
    process.stdout.write(`[${index + 1}/${cards.length}] ${card.name} ... `);
    try {
      const detail = await fetchDetailWithRetry(url);
      const venue = toVenue(card, detail);
      scrapedVenues.push(venue);
      for (const key of identityKeysForVenue(venue)) known.add(key);
      console.log("ok");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ url, error: message });
      console.log(`fail (${message})`);
      // 404 / exhausted retries: keep listing-only fallback so seed still gets core fields.
      const venue = toVenue(card, {
        description: card.blurb,
        hours: null,
        services: [],
        address: card.address,
        phone: card.phone,
        website: card.website,
        staff: [],
        coverImageUrl: card.coverImageUrl,
      });
      scrapedVenues.push(venue);
      for (const key of identityKeysForVenue(venue)) known.add(key);
    }

    if (index < cards.length - 1) {
      const waited = await sleepRandom(DETAIL_DELAY_MIN_MS, DETAIL_DELAY_MAX_MS);
      console.log(`  waited ${waited}ms before next detail`);
    }
  }

  const merged = mergeVenues(existingFile?.venues || [], scrapedVenues);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  const payload: ScrapedFile = {
    scrapedAt: new Date().toISOString(),
    sourceListingUrl: LISTING_URL,
    count: merged.length,
    errors: [...(existingFile?.errors || []), ...errors],
    venues: merged,
  };
  writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Wrote ${merged.length} venues (${scrapedVenues.length} new/updated this run) -> ${OUT_FILE}`,
  );
  if (errors.length) {
    console.log(`Detail fetch warnings this run: ${errors.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
