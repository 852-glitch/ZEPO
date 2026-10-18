// Outbound redirect logic for /go/[slug]. Dependencies are injected, so the tests can exercise
// every failure path without a database.
//
// Order of operations:
//   1. Reject malformed slugs with no database call.
//   2. Resolve the destination first. Only a published product has one.
//   3. Count the click, waiting at most RECORD_TIMEOUT_MS. A failed or slow count never blocks
//      the redirect.
//   4. Redirect.
// HEAD requests resolve the destination but never count a click.

export const SLUG_PATTERN = /^[a-z0-9-]{2,80}$/;
export const RECORD_TIMEOUT_MS = 1000;

export type GoOutcome =
  | { kind: "redirect"; location: string }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export type GoDeps = {
  // Returns the destination for a published slug, or null. Throws on a database failure.
  lookupDestination: (slug: string) => Promise<string | null>;
  // Increments the counter. Throws on a database failure.
  recordClick: (slug: string) => Promise<unknown>;
  // Receives a short, non-sensitive message. Never request headers, IP addresses, or user data.
  log?: (message: string) => void;
};

export async function resolveGo(
  slug: string,
  options: { count: boolean; timeoutMs?: number },
  deps: GoDeps,
): Promise<GoOutcome> {
  const log = deps.log ?? (() => undefined);

  if (!SLUG_PATTERN.test(slug)) {
    return { kind: "not-found" };
  }

  let destination: string | null;
  try {
    destination = await deps.lookupDestination(slug);
  } catch (error) {
    log(`go: destination lookup failed: ${describe(error)}`);
    return { kind: "unavailable" };
  }
  if (!destination) {
    return { kind: "not-found" };
  }

  if (options.count) {
    const counted = Promise.resolve()
      .then(() => deps.recordClick(slug))
      .then(
        () => undefined,
        (error: unknown) => log(`go: click count failed: ${describe(error)}`),
      );
    await withTimeout(counted, options.timeoutMs ?? RECORD_TIMEOUT_MS, () =>
      log("go: click count timed out; redirecting anyway"),
    );
  }

  return { kind: "redirect", location: destination };
}

// Resolves after the promise settles or after ms, whichever comes first. Clears the timer either way.
export function withTimeout(
  promise: Promise<void>,
  ms: number,
  onTimeout: () => void,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      onTimeout();
      resolve();
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
