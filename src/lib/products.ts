import "server-only";
import { SLUG_PATTERN } from "@/admin/product-form";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicProduct } from "@/types/product";

// Explicit column list. Anon cannot select click_count or destination_url,
// and select("*") would fail for anon.
const PUBLIC_COLUMNS =
  "id, slug, name, description, review, image_url, is_affiliate, display_order, is_published, created_at, updated_at";

// Throws on query errors so the route's error boundary can show the retry state.
// An empty list is a valid result, not an error.
export async function listPublishedProducts(): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }
  return (data ?? []) as PublicProduct[];
}

// Returns null for a missing, unpublished, or malformed slug. Throws on query errors.
export async function getPublishedProductBySlug(slug: string): Promise<PublicProduct | null> {
  if (!SLUG_PATTERN.test(slug)) {
    return null;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`);
  }
  return (data as PublicProduct | null) ?? null;
}
