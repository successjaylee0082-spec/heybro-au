import { headers } from "next/headers";
import type { Locale } from "@/types";
import { isLocale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const value = headerStore.get("x-heybro-locale");
  return isLocale(value) ? value : "en";
}

export async function getRequestPagePath(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get("x-heybro-page-path") || "/";
}
