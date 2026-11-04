/**
 * Respectful scraper for public Sydney listings on brothels.com.au.
 *
 * Defaults:
 * - writes JSON only (no database writes)
 * - rate-limits detail fetches
 * - checks robots.txt Allow before crawling
 *
 * Usage:
 *   pnpm scrape
 *   pnpm scrape -- --limit=10
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import * as cheerio from "cheerio";
import { chromium, type Page } from "@playwright/test";
import type { ScrapedStaffMember, ScrapedVenue } from "../types/scraped-venue";
import {
  absoluteUrl,
  browserHeaders,
  cleanText,
  isLikelyStaffImage,
  normalizePhone,
  parseAustralianAddress,
  sleep,
  slugFromSourceUrl,
  sourceIdFromUrl,
  userAgent,
} from "./lib/scrape-utils";

/** Delay between detail-page fetches to reduce bot/rate-limit pressure. */
const DETAIL_REQUEST_DELAY_MS = 2500;

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

function argValue(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
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
  // Allow lazy VC grid items to settle.
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

async function fetchDetail(sourceUrl: string) {
  const { data, status } = await axios.get<string>(sourceUrl, {
    headers: browserHeaders({
      Referer: LISTING_URL,
    }),
    timeout: 30000,
    responseType: "text",
    maxRedirects: 5,
    validateStatus: () => true,
  });
  if (status >= 400) {
    throw new Error(`Detail fetch failed ${status} for ${sourceUrl}`);
  }
  return parseDetailHtml(data, sourceUrl);
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

async function main() {
  const limit = Number(argValue("--limit") || process.env.SCRAPE_LIMIT || "0");
  await assertRobotsAllows("/brothels-in-sydney/");

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
  if (limit > 0) cards = cards.slice(0, limit);

  console.log(`Collected ${cards.length} Sydney listing cards`);

  const venues: ScrapedVenue[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  for (const [index, card] of cards.entries()) {
    const url = absoluteUrl(card.sourceUrl);
    process.stdout.write(`[${index + 1}/${cards.length}] ${card.name} ... `);
    try {
      // Prefer canonical /brothel/slug pages when the card points at ?p=
      let detailUrl = url;
      if (/[?&]p=\d+/.test(url)) {
        // Still fetch the post URL; WordPress will serve the venue page.
        detailUrl = url;
      }
      const detail = await fetchDetail(detailUrl);
      venues.push(toVenue(card, detail));
      console.log("ok");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ url, error: message });
      console.log(`fail (${message})`);
      // Keep listing-only fallback so the seed still gets core fields.
      venues.push(
        toVenue(card, {
          description: card.blurb,
          hours: null,
          services: [],
          address: card.address,
          phone: card.phone,
          website: card.website,
          staff: [],
          coverImageUrl: card.coverImageUrl,
        }),
      );
    }
    await sleep(DETAIL_REQUEST_DELAY_MS);
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  const payload = {
    scrapedAt: new Date().toISOString(),
    sourceListingUrl: LISTING_URL,
    count: venues.length,
    errors,
    venues,
  };
  writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${venues.length} venues -> ${OUT_FILE}`);
  if (errors.length) {
    console.log(`Detail fetch warnings: ${errors.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
