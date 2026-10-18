import { describe, expect, it, vi } from "vitest";
import { RECORD_TIMEOUT_MS, resolveGo, withTimeout, type GoDeps } from "@/lib/go";

const PUBLISHED = "https://example.com/tool";

function makeDeps(overrides: Partial<GoDeps> = {}) {
  // log is set last so tests always get a typed mock to inspect.
  const log = vi.fn<(message: string) => void>();
  return {
    lookupDestination: vi.fn(async (slug: string) => (slug === "live-tool" ? PUBLISHED : null)),
    recordClick: vi.fn(async () => undefined),
    ...overrides,
    log,
  };
}

describe("resolveGo", () => {
  it("redirects a published product and counts the click", async () => {
    const deps = makeDeps();
    const outcome = await resolveGo("live-tool", { count: true }, deps);
    expect(outcome).toEqual({ kind: "redirect", location: PUBLISHED });
    expect(deps.recordClick).toHaveBeenCalledWith("live-tool");
  });

  it("returns not-found for a draft or unknown slug and never counts", async () => {
    const deps = makeDeps();
    expect(await resolveGo("draft-tool", { count: true }, deps)).toEqual({ kind: "not-found" });
    expect(deps.recordClick).not.toHaveBeenCalled();
  });

  it("rejects malformed slugs without touching the database", async () => {
    const deps = makeDeps();
    for (const bad of ["A", "has_underscore", "../etc", "x".repeat(81), ""]) {
      expect(await resolveGo(bad, { count: true }, deps)).toEqual({ kind: "not-found" });
    }
    expect(deps.lookupDestination).not.toHaveBeenCalled();
    expect(deps.recordClick).not.toHaveBeenCalled();
  });

  it("returns unavailable when the destination lookup fails, not not-found", async () => {
    const deps = makeDeps({
      lookupDestination: vi.fn(async () => {
        throw new Error("boom");
      }),
    });
    expect(await resolveGo("live-tool", { count: true }, deps)).toEqual({ kind: "unavailable" });
    expect(deps.recordClick).not.toHaveBeenCalled();
  });

  it("still redirects when the counter update rejects", async () => {
    const deps = makeDeps({
      recordClick: vi.fn(async () => {
        throw new Error("counter down");
      }),
    });
    expect(await resolveGo("live-tool", { count: true }, deps)).toEqual({ kind: "redirect", location: PUBLISHED });
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining("click count failed"));
  });

  it("still redirects when the counter throws synchronously", async () => {
    const deps = makeDeps({
      recordClick: (() => {
        throw new Error("sync failure");
      }) as unknown as GoDeps["recordClick"],
    });
    expect(await resolveGo("live-tool", { count: true }, deps)).toEqual({ kind: "redirect", location: PUBLISHED });
  });

  it("redirects within the timeout when the counter never finishes", async () => {
    const deps = makeDeps({ recordClick: vi.fn(() => new Promise<unknown>(() => undefined)) });
    const started = Date.now();
    const outcome = await resolveGo("live-tool", { count: true, timeoutMs: 50 }, deps);
    const elapsed = Date.now() - started;
    expect(outcome).toEqual({ kind: "redirect", location: PUBLISHED });
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(RECORD_TIMEOUT_MS);
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining("timed out"));
  });

  it("HEAD (count: false) resolves the destination but never counts", async () => {
    const deps = makeDeps();
    expect(await resolveGo("live-tool", { count: false }, deps)).toEqual({ kind: "redirect", location: PUBLISHED });
    expect(deps.recordClick).not.toHaveBeenCalled();
  });

  it("logs short messages only, with no request or network data", async () => {
    const deps = makeDeps({
      recordClick: vi.fn(async () => {
        throw new Error("db said no");
      }),
    });
    await resolveGo("live-tool", { count: true }, deps);
    for (const [message] of deps.log.mock.calls) {
      expect(message).not.toMatch(/ip|header|cookie|authorization/i);
    }
  });
});

describe("withTimeout", () => {
  it("resolves when the promise settles first", async () => {
    await expect(withTimeout(Promise.resolve(), 1000, () => undefined)).resolves.toBeUndefined();
  });

  it("calls onTimeout and resolves when the promise is slower", async () => {
    const onTimeout = vi.fn();
    await withTimeout(new Promise(() => undefined), 10, onTimeout);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });
});
