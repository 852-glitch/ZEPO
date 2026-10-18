import { Suspense } from "react";
import { ContactSection } from "@/components/ContactSection";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductList } from "@/components/ProductList";

// The page shell is static. The product grid streams in behind its own Suspense boundary.
export default function HomePage() {
  return (
    <main className="container">
      <section>
        <h1>מוצרי AI ששווה להכיר</h1>
        <p>מבחר מצומצם של מוצרים, עם הסבר ברור על השימושים, היתרונות והמגבלות של כל אחד.</p>
        <p>חלק מהקישורים באתר הם קישורי שותפים. ייתכן שנקבל עמלה בעקבות רכישה דרכם.</p>
      </section>

      <section id="products" aria-label="המוצרים">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductList />
        </Suspense>
      </section>

      <ContactSection />
    </main>
  );
}
