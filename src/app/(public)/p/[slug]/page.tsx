import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProductImage } from "@/components/ProductImage";
import { getPublishedProductBySlug } from "@/lib/products";

const dateFormat = new Intl.DateTimeFormat("he-IL", {
  dateStyle: "medium",
  timeZone: "Asia/Jerusalem",
});

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getPublishedProductBySlug(slug);
  return product ? { title: product.name, description: product.description } : { title: "המוצר לא נמצא" };
}

// Product page. Published products only. Missing and unpublished slugs both return 404.
// A database error is not a 404; it goes to the error boundary.
export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  await connection();
  const { slug } = await props.params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <main className="page">
      <section className="product-hero on-dark">
        <div className="container">
          <Link href="/#products" className="back-link">
            ← לכל המוצרים
          </Link>
          <p className="eyebrow">מוצר AI</p>
          <h1>{product.name}</h1>
          <p className="product-lead">{product.description}</p>
        </div>
      </section>

      <div className="container product-body">
        <div className="product-layout">
          {/* The ticket comes first in reading order, so the link to the product is easy to reach. */}
          <aside className="ticket" aria-label="מעבר לאתר המוצר">
            <a className="button" href={`/go/${product.slug}`} target="_blank" rel="sponsored noopener noreferrer">
              מעבר לאתר המוצר
            </a>
            <p className="ticket-note">
              {product.is_affiliate
                ? "זהו קישור שותפים. ייתכן שנקבל עמלה בעקבות רכישה דרכו, ללא עלות נוספת לכם."
                : "הקישור מוביל לאתר החיצוני של המוצר."}
            </p>
            <p className="ticket-date">עודכן לאחרונה: {dateFormat.format(new Date(product.updated_at))}</p>
          </aside>

          <div>
            <div className="product-media">
              <ProductImage src={product.image_url} alt={product.name} />
            </div>

            {product.review && (
              <section aria-labelledby="review-heading" className="review">
                <h2 id="review-heading">ביקורת</h2>
                {/* Plain text. Line breaks come from CSS (pre-line); no HTML is ever rendered. */}
                <p className="review-text">{product.review}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
