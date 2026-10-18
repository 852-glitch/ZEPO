import { describe, expect, it, vi, beforeAll, afterEach } from "vitest";
import { EMPTY_PRODUCT_FORM } from "@/admin/product-form";
import type { ProductFormState } from "@/admin/actions";
import { createServiceClient } from "@/lib/supabase/service";

// Calls the real exported server actions in-process, with the cookies supplied directly. The proxy
// is not in this path, so these tests exercise requireAdmin() inside each action on its own.

// The cookie jar that the mocked next/headers returns. Each test sets it.
let cookieJar: { name: string; value: string }[] = [];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => cookieJar,
    set: () => undefined,
  }),
}));

// Real redirect() throws inside a request. Here it throws a plain error that records the target,
// so the tests can assert where each action sent the caller.
class RedirectSignal extends Error {
  constructor(public readonly url: string) {
    super(`redirect to ${url}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
}));

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isLocalStack = /^http:\/\/(127\.0\.0\.1|localhost):54321/.test(supabaseUrl);
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Local seed rows (supabase/seed.sql).
const PUBLISHED_ID = "local-test-published-one";
const DRAFT_ID = "local-test-draft";

async function sessionCookie(email: string, password: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`local sign-in failed for ${email}: ${response.status}`);
  const session = await response.json();
  // @supabase/ssr stores the session in a cookie named sb-<first hostname label>-auth-token.
  const value = `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
  return { name: "sb-127-auth-token", value };
}

async function rowFor(slug: string) {
  const { data, error } = await createServiceClient()
    .from("products")
    .select("id, name, slug, is_published, destination_url, click_count")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

function formFor(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

const idleState: ProductFormState = { status: "idle", values: EMPTY_PRODUCT_FORM };

describe.skipIf(!isLocalStack || !anonKey)("server actions called directly, without the proxy", () => {
  let admin: { name: string; value: string };
  let member: { name: string; value: string };

  beforeAll(async () => {
    admin = await sessionCookie("admin@local.test", "local-admin-pass-123");
    member = await sessionCookie("member@local.test", "local-member-pass-123");
  });

  afterEach(() => {
    cookieJar = [];
  });

  it("control: a real admin session can publish and unpublish through setPublished", async () => {
    const actions = await import("@/admin/actions");
    cookieJar = [admin];

    await expect(actions.setPublished(formFor({ product_id: (await rowFor(DRAFT_ID)).id, publish: "true" })))
      .rejects.toMatchObject({ url: "/admin?notice=published" });
    expect((await rowFor(DRAFT_ID)).is_published).toBe(true);

    await expect(actions.setPublished(formFor({ product_id: (await rowFor(DRAFT_ID)).id, publish: "false" })))
      .rejects.toMatchObject({ url: "/admin?notice=unpublished" });
    expect((await rowFor(DRAFT_ID)).is_published).toBe(false);
  });

  it("a non-admin session cannot publish through setPublished, and the row does not change", async () => {
    const actions = await import("@/admin/actions");
    const before = await rowFor(DRAFT_ID);
    cookieJar = [member];

    await expect(actions.setPublished(formFor({ product_id: before.id, publish: "true" })))
      .rejects.toMatchObject({ url: "/admin/login" });

    expect((await rowFor(DRAFT_ID)).is_published).toBe(before.is_published);
  });

  it("a non-admin session cannot save an edit through saveProduct, and the row does not change", async () => {
    const actions = await import("@/admin/actions");
    const before = await rowFor(PUBLISHED_ID);
    cookieJar = [member];

    await expect(
      actions.saveProduct(
        before.id,
        idleState,
        formFor({
          slug: PUBLISHED_ID,
          name: "CHANGED BY NON-ADMIN",
          description: "x",
          destination_url: "https://example.com/hijack",
          display_order: "1",
          intent: "publish",
        }),
      ),
    ).rejects.toMatchObject({ url: "/admin/login" });

    const after = await rowFor(PUBLISHED_ID);
    expect(after.name).toBe(before.name);
    expect(after.destination_url).toBe(before.destination_url);
  });

  it("a request with no session cannot create a product through saveProduct", async () => {
    const actions = await import("@/admin/actions");
    const countBefore = (await createServiceClient().from("products").select("id", { count: "exact", head: true })).count;
    cookieJar = [];

    await expect(
      actions.saveProduct(
        null,
        idleState,
        formFor({ slug: "no-session-product", name: "No session", description: "", display_order: "0", intent: "draft" }),
      ),
    ).rejects.toMatchObject({ url: "/admin/login" });

    const countAfter = (await createServiceClient().from("products").select("id", { count: "exact", head: true })).count;
    expect(countAfter).toBe(countBefore);
  });
});
