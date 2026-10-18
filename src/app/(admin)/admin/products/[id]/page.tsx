import { notFound } from "next/navigation";
import { ProductForm } from "@/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const search = await props.searchParams;
  const created = search.created === "draft" || search.created === "publish" ? search.created : null;
  const { supabase } = await requireAdmin();

  // Reject malformed ids before they reach Postgres, which would return an error for them.
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, name, description, review, image_url, destination_url, is_affiliate, display_order, is_published")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load the product.");
  }
  if (!product) {
    notFound();
  }

  return (
    <>
      <h1>Edit product</h1>
      <ProductForm
        productId={product.id}
        createdAs={created}
        initial={{
          slug: product.slug,
          name: product.name,
          description: product.description,
          review: product.review ?? "",
          image_url: product.image_url ?? "",
          destination_url: product.destination_url,
          is_affiliate: product.is_affiliate,
          display_order: String(product.display_order),
          confirm_slug_change: false,
        }}
        originalSlug={product.slug}
        originalPublished={product.is_published}
      />
    </>
  );
}
