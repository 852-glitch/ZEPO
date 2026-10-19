import { describe, expect, it, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { GET } from "@/app/go/[slug]/route";

// Runs only against the local stack, so it can never touch cloud data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isLocalStack = /^http:\/\/(127\.0\.0\.1|localhost):54321/.test(supabaseUrl);
const ready = isLocalStack && Boolean(anonKey) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Rows from supabase/seed.sql (local-test-* slugs only).
const PUBLISHED = "local-test-published-two";
const PUBLISHED_DESTINATION = "https://example.com/local-test-two";
const DRAFT = "local-test-draft";

const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function anonClient() {
  return createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

function callGet(slug: string): Promise<Response> {
  const request = new Request(`http://localhost/go/${slug}`, { method: "GET" }) as unknown as NextRequest;
  const context = { params: Promise.resolve({ slug }) } as unknown as Parameters<typeof GET>[1];
  return GET(request, context);
}

describe.skipIf(!ready)("get_destination and the anon-key lookup", () => {
  afterEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
  });

  it("returns the destination for a published slug", async () => {
    const { data, error } = await anonClient().rpc("get_destination", { p_slug: PUBLISHED });
    expect(error).toBeNull();
    expect(data).toBe(PUBLISHED_DESTINATION);
  });

  it("returns null for a draft and for an unknown slug", async () => {
    const draft = await anonClient().rpc("get_destination", { p_slug: DRAFT });
    const unknown = await anonClient().rpc("get_destination", { p_slug: "local-test-does-not-exist" });
    expect(draft.error).toBeNull();
    expect(draft.data).toBeNull();
    expect(unknown.error).toBeNull();
    expect(unknown.data).toBeNull();
  });

  it("does not let a public caller change data", async () => {
    const client = anonClient();
    const update = await client.from("products").update({ destination_url: "https://example.com/hijack" }).eq("slug", PUBLISHED);
    expect(update.error).not.toBeNull();

    const counter = await client.rpc("record_click", { p_slug: PUBLISHED });
    expect(counter.error).not.toBeNull();
  });

  it("still redirects when the counter fails", async () => {
    // A key that the database rejects makes record_click fail. The redirect must still happen.
    process.env.SUPABASE_SERVICE_ROLE_KEY = "not-a-real-key";
    const response = await callGet(PUBLISHED);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(PUBLISHED_DESTINATION);
  });
});
