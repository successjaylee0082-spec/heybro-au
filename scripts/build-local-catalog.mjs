import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "data", "local-catalog.json");

const catalog = {
  generatedAt: new Date().toISOString(),
  source: "demo-feed",
  pages: [
    {
      city: "sydney",
      suburb: "surry-hills",
      category: "massage",
      status: "empty-preview",
      noindex: true,
    },
    {
      city: "melbourne",
      suburb: "st-kilda",
      category: "nightclub",
      status: "empty-preview",
      noindex: true,
    },
    {
      city: "brisbane",
      suburb: "fortitude-valley",
      category: "escorts",
      status: "unavailable",
      noindex: true,
    },
  ],
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${outFile}`);
