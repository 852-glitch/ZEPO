// Repeat suppression for outbound button clicks. A product is counted at most once per browser per
// 24 hours. This is approximate: clearing storage, another browser, or private browsing can count
// again. It is not a unique-visitor count and it identifies no person.

export const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const STORAGE_PREFIX = "zepo:counted:";

export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

// Returns true when this click should be counted, and records the attempt before the request is
// sent, so rapid double clicks count once. Any storage error returns false: the link still works,
// and the click is simply not counted.
export function shouldCount(slug: string, store: KeyValueStore | null, now: number): boolean {
  if (!store) return false;
  try {
    const key = STORAGE_PREFIX + slug;
    const last = Number(store.getItem(key));
    const countedRecently = Number.isFinite(last) && last > 0 && last <= now && now - last < DEDUPE_WINDOW_MS;
    if (countedRecently) return false;
    store.setItem(key, String(now));
    return true;
  } catch {
    return false;
  }
}
