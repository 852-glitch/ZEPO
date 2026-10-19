import Link from "next/link";
import { connection } from "next/server";
import { ProductImage } from "@/components/ProductImage";
import { isDemoPreviewEnabled } from "@/config/preview";
import { listPublishedProducts } from "@/lib/products";

// Async server component. The connection() call makes this part render at request time,
// so admin edits show up on the next page load. It sits inside <Suspense> on the page.
// Each product is a numbered row. Hover or keyboard focus fills the row with ink; all content is
// visible without hover, and the preview image is decorative.
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
    <ol className="index">
      {products.map((product, position) => {
        const content = (
          <>
            <span className="index-num" aria-hidden="true">
              {String(position + 1).padStart(2, "0")}
            </span>
            <div className="index-main">
              {demo && <span className="badge">לדוגמה</span>}
              <h3 className="index-name">{product.name}</h3>
              <p className="index-desc">{product.description}</p>
            </div>
            <span className="index-go" aria-hidden="true">
              ←
            </span>
            <span className="index-media" aria-hidden="true">
              <ProductImage src={product.image_url} alt="" />
            </span>
          </>
        );

        return (
          <li key={product.id} className="index-row reveal">
            {demo ? (
              // Demo rows have no outbound link. No affiliate URL is invented.
              <div className="index-link" aria-disabled="true">
                {content}
              </div>
            ) : (
              <Link className="index-link" href={`/p/${product.slug}`}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
