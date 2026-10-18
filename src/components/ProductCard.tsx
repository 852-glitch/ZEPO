import type { PublicProduct } from "@/types/product";
import { ProductImage } from "@/components/ProductImage";

// Day 1 card: no link yet. The product page and the "לפרטים" link come on Day 3.
export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <article className="card">
      <ProductImage src={product.image_url} alt="" />
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="card-description">{product.description}</p>
      </div>
    </article>
  );
}
