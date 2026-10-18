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
    <main className="container product-page">
      <p>
        <Link href="/#products">← לכל המוצרים</Link>
      </p>

      <article>
        <h1>{product.name}</h1>
        <p className="product-description">{product.description}</p>

        <ProductImage src={product.image_url} alt={product.name} />

        {product.review && (
          <section aria-labelledby="review-heading" className="review">
            <h2 id="review-heading">ביקורת</h2>
            {/* Plain text. Line breaks come from CSS (pre-line); no HTML is ever rendered. */}
            <p className="review-text">{product.review}</p>
          </section>
        )}

        <section className="cta" aria-label="מעבר לאתר המוצר">
          <a className="button" href={`/go/${product.slug}`} rel="sponsored noopener noreferrer">
            מעבר לאתר המוצר
          </a>
          <p className="disclosure">
            {product.is_affiliate
              ? "זהו קישור שותפים. ייתכן שנקבל עמלה בעקבות רכישה דרכו, ללא עלות נוספת לכם."
              : "הקישור מוביל לאתר החיצוני של המוצר."}
          </p>
        </section>

        <p className="updated">עודכן לאחרונה: {dateFormat.format(new Date(product.updated_at))}</p>
      </article>
    </main>
  );
}
