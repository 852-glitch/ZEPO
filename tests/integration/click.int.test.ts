import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/click/route";
import { createServiceClient } from "@/lib/supabase/service";

// Runs against the local stack only, so it can never touch cloud data.
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isLocalStack = /^http:\/\/(127\.0\.0\.1|localhost):54321/.test(supabaseUrl);
const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// A product that no other integration test counts. Test files run in parallel, so sharing a
// product would make another file's count change in the middle of this one.
const PUBLISHED = "local-test-published-one";
const DRAFT = "local-test-draft";

function postClick(body: unknown): Promise<Response> {
  const request = new Request("http://localhost/api/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
  return POST(request);
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

describe.skipIf(!isLocalStack || !hasServiceKey)("POST /api/click against the local database", () => {
  it("counts exactly one click for a published product", async () => {
    const before = await clickCount(PUBLISHED);
    const response = await postClick({ slug: PUBLISHED });

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await clickCount(PUBLISHED)).toBe(before + 1);
  });

  it("returns 404 for a draft and does not count it", async () => {
    const before = await clickCount(DRAFT);
    const response = await postClick({ slug: DRAFT });

    expect(response.status).toBe(404);
    expect(await clickCount(DRAFT)).toBe(before);
  });

  it("rejects a missing or malformed slug with 400 and no count", async () => {
    expect((await postClick({})).status).toBe(400);
    expect((await postClick({ slug: "BAD_SLUG" })).status).toBe(400);
    expect((await postClick("not json")).status).toBe(400);
  });
});
