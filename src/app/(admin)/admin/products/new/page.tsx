import { ProductForm } from "@/admin/ProductForm";
import { EMPTY_PRODUCT_FORM } from "@/admin/product-form";
import { requireAdmin } from "@/lib/admin";

// New products start as drafts. Publishing is a separate, explicit action in the editor.
export default async function NewProductPage() {
  await requireAdmin();
  return (
    <>
      <h1>Add product</h1>
      <ProductForm
        productId={null}
        initial={EMPTY_PRODUCT_FORM}
        originalSlug=""
        originalPublished={false}
      />
    </>
  );
}
