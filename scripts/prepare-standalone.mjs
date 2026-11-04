import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");

if (!existsSync(join(standalone, "server.js"))) {
  console.error("Missing .next/standalone/server.js. Run pnpm build first.");
  process.exit(1);
}

mkdirSync(join(standalone, ".next"), { recursive: true });
cpSync(staticDir, join(standalone, ".next", "static"), { recursive: true });
cpSync(publicDir, join(standalone, "public"), { recursive: true });
console.log("Prepared standalone server assets.");
