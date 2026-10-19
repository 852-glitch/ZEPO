import { describe, expect, it } from "vitest";
import { DEDUPE_WINDOW_MS, STORAGE_PREFIX, shouldCount, type KeyValueStore } from "@/lib/click-dedupe";

// In-memory stand-in for window.localStorage.
function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const T0 = 1_800_000_000_000;

describe("shouldCount", () => {
  it("counts the first click for a product", () => {
    const store = memoryStore();
    expect(shouldCount("echoes", store, T0)).toBe(true);
    expect(store.data.get(STORAGE_PREFIX + "echoes")).toBe(String(T0));
  });

  it("does not count a repeat click within 24 hours", () => {
    const store = memoryStore();
    shouldCount("echoes", store, T0);
    expect(shouldCount("echoes", store, T0 + 1_000)).toBe(false);
    expect(shouldCount("echoes", store, T0 + DEDUPE_WINDOW_MS - 1)).toBe(false);
  });

  it("counts again once 24 hours have passed", () => {
    const store = memoryStore();
    shouldCount("echoes", store, T0);
    expect(shouldCount("echoes", store, T0 + DEDUPE_WINDOW_MS)).toBe(true);
  });

  it("counts other products independently", () => {
    const store = memoryStore();
    shouldCount("echoes", store, T0);
    expect(shouldCount("barbot", store, T0 + 1_000)).toBe(true);
  });

  it("marks the attempt before any request, so a double click counts once", () => {
    const store = memoryStore();
    expect(shouldCount("echoes", store, T0)).toBe(true);
    expect(shouldCount("echoes", store, T0)).toBe(false);
  });

  it("skips counting when storage is unavailable, without throwing", () => {
    expect(shouldCount("echoes", null, T0)).toBe(false);
  });

  it("skips counting when storage throws", () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => shouldCount("echoes", broken, T0)).not.toThrow();
    expect(shouldCount("echoes", broken, T0)).toBe(false);
  });

  it("treats a timestamp in the future as expired, not as a block", () => {
    const store = memoryStore();
    store.setItem(STORAGE_PREFIX + "echoes", String(T0 + 10 * DEDUPE_WINDOW_MS));
    expect(shouldCount("echoes", store, T0)).toBe(true);
  });
});
