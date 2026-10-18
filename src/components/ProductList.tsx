import Link from "next/link";
import { connection } from "next/server";
import { ProductImage } from "@/components/ProductImage";
import { isDemoPreviewEnabled } from "@/config/preview";
import { listPublishedProducts } from "@/lib/products";

// Async server component. The connection() call makes this part render at request time,
// so admin edits show up on the next page load. It sits inside <Suspense> on the page.
export async function ProductList() {
  await connection();

  // Demo mode replaces the query entirely. Supabase is not called, and a failed query never
  // switches to demo content: that path goes through the error boundary.
  const demo = isDemoPreviewEnabled();
  const products = demo
    ? (await import("@/demo/fixtures")).DEMO_PRODUCTS
    : await listPublishedProducts();

  if (products.length === 0) {
    return <p className="state">מוצרים חדשים יופיעו כאן בקרוב.</p>;
  }

  return (
    <ul className="grid product-list">
      {products.map((product) => (
        <li key={product.id}>
          <article className="card">
            <ProductImage src={product.image_url} alt={product.name} />
            <div className="card-body">
              {demo && <span className="badge">לדוגמה</span>}
              <h2 className="card-title">{product.name}</h2>
              <p className="card-description">{product.description}</p>
              {demo ? (
                // Demo cards have no outbound link. No affiliate URL is invented.
                <span className="control-disabled" aria-disabled="true">
                  לפרטים על המוצר (בקרוב)
                </span>
              ) : (
                <Link href={`/p/${product.slug}`}>לפרטים על המוצר ←</Link>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
