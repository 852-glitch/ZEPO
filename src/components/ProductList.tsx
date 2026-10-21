import Link from "next/link";
import { connection } from "next/server";
import { ProductImage } from "@/components/ProductImage";
import { listPublishedProducts } from "@/lib/products";

// Async server component. The connection() call makes this part render at request time,
// so admin edits show up on the next page load. It sits inside <Suspense> on the page.
// Each product is a numbered row. Hover or keyboard focus fills the row with ink; all content is
// visible without hover, and the preview image is decorative.
export async function ProductList() {
  await connection();

  // A failed query throws and goes to the error boundary. It is never shown as an empty list.
  const products = await listPublishedProducts();

  if (products.length === 0) {
    return <p className="state">מוצרים חדשים יופיעו כאן בקרוב.</p>;
  }

  return (
    <ol className="index">
      {products.map((product, position) => (
        <li key={product.id} className="index-row reveal">
          <Link className="index-link" href={`/p/${product.slug}`}>
            <span className="index-num" aria-hidden="true">
              {String(position + 1).padStart(2, "0")}
            </span>
            <div className="index-main">
              <h3 className="index-name">{product.name}</h3>
              <p className="index-desc">{product.description}</p>
            </div>
            <span className="index-go" aria-hidden="true">
              ←
            </span>
            <span className="index-media" aria-hidden="true">
              <ProductImage src={product.image_url} alt="" />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
