import "server-only";

import { cookies } from "next/headers";

export const ADMIN_COOKIE = "heybro-admin-panel";

export function getAdminPanelKey(): string | null {
  const key = process.env.ADMIN_PANEL_KEY?.trim();
  return key || null;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPanelKey());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const key = getAdminPanelKey();
  if (!key) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === key;
}

export function assertAdminKey(candidate: string | null | undefined): boolean {
  const key = getAdminPanelKey();
  return Boolean(key && candidate && candidate === key);
}
