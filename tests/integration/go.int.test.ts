import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET, HEAD } from "@/app/go/[slug]/route";
import { createServiceClient } from "@/lib/supabase/service";

// These tests call the real /go route handlers against the local stack, and they write click counts.
// They refuse to run unless SUPABASE_URL points at the local stack, so they can never touch cloud data.
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isLocalStack = /^http:\/\/(127\.0\.0\.1|localhost):54321/.test(supabaseUrl);
const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Rows from supabase/seed.sql (local-test-* slugs only).
const PUBLISHED = "local-test-published-two";
const PUBLISHED_DESTINATION = "https://example.com/local-test-two";
const DRAFT = "local-test-draft";

type Method = "GET" | "HEAD";

function callRoute(method: Method, slug: string): Promise<Response> {
  const request = new Request(`http://localhost/go/${slug}`, { method }) as unknown as NextRequest;
  const context = { params: Promise.resolve({ slug }) } as unknown as Parameters<typeof GET>[1];
  return method === "GET" ? GET(request, context) : HEAD(request, context);
}

async function clickCount(slug: string): Promise<number> {
  const { data, error } = await createServiceClient()
    .from("products")
    .select("click_count")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(`could not read click_count for ${slug}: ${error.message}`);
  return Number(data.click_count);
}

describe.skipIf(!isLocalStack || !hasServiceKey)("/go route against the local database", () => {
  it("redirects a published product with no-store and counts exactly one click", async () => {
    const before = await clickCount(PUBLISHED);
    const response = await callRoute("GET", PUBLISHED);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(PUBLISHED_DESTINATION);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await clickCount(PUBLISHED)).toBe(before + 1);
  });

  it("HEAD redirects the same way but does not count", async () => {
    const before = await clickCount(PUBLISHED);
    const response = await callRoute("HEAD", PUBLISHED);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(PUBLISHED_DESTINATION);
    expect(await clickCount(PUBLISHED)).toBe(before);
  });

  it("returns 404 for an unpublished draft and does not count it", async () => {
    const before = await clickCount(DRAFT);
    const response = await callRoute("GET", DRAFT);

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
    expect(await clickCount(DRAFT)).toBe(before);
  });

  it("returns 404 for an unknown slug", async () => {
    const response = await callRoute("GET", "local-test-does-not-exist");
    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });

  it("returns 404 for a malformed slug without a database lookup", async () => {
    const response = await callRoute("GET", "BAD_SLUG");
    expect(response.status).toBe(404);
  });
});
