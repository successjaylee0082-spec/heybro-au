export const AGE_STORAGE_KEY = "heybro-age-agreement";
export const AGE_VERSION = 1;
export const AGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AgeRecord = {
  version: number;
  acceptedAt: number;
  expiresAt: number;
};

const listeners = new Set<() => void>();

function notifyAgeListeners() {
  for (const listener of listeners) listener();
}

export function createAgeRecord(now = Date.now()): AgeRecord {
  return {
    version: AGE_VERSION,
    acceptedAt: now,
    expiresAt: now + AGE_TTL_MS,
  };
}

export function parseAgeRecord(raw: string | null, now = Date.now()): AgeRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AgeRecord>;
    if (
      parsed.version !== AGE_VERSION ||
      typeof parsed.acceptedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    if (parsed.acceptedAt > now || parsed.expiresAt <= now) return null;
    return parsed as AgeRecord;
  } catch {
    return null;
  }
}

export function readAgeAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(parseAgeRecord(window.localStorage.getItem(AGE_STORAGE_KEY)));
  } catch {
    return false;
  }
}

export function subscribeAgeAccepted(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === AGE_STORAGE_KEY || event.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAgeAcceptedSnapshot(): boolean {
  return readAgeAccepted();
}

export function getAgeAcceptedServerSnapshot(): boolean {
  return false;
}

export function writeAgeAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      AGE_STORAGE_KEY,
      JSON.stringify(createAgeRecord()),
    );
    notifyAgeListeners();
    return true;
  } catch {
    return false;
  }
}

export function clearAgeAccepted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AGE_STORAGE_KEY);
    notifyAgeListeners();
  } catch {
    // ignore
  }
}
