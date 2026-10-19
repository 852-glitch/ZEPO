import Link from "next/link";
import { Suspense } from "react";
import { ContactSection } from "@/components/ContactSection";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductList } from "@/components/ProductList";
import { SectionNav } from "@/components/SectionNav";

// Editorial layout: a type-led hero, a numbered section bar, an index of products, one oversized
// disclosure sentence, and a contact band. The product list streams in behind Suspense.
export default function HomePage() {
  return (
    <main className="page">
      <section className="hero on-dark" aria-labelledby="hero-heading">
        <div className="container">
          <p className="hero-eyebrow">מדריך מוצרי AI</p>
          <h1 id="hero-heading">
            <span className="line">
              <span>מוצרי AI</span>
            </span>
            <span className="line">
              <span className="accent">ששווה</span>
            </span>
            <span className="line">
              <span>להכיר</span>
            </span>
          </h1>

          <div className="hero-foot">
            <p className="hero-lead">
              מבחר מצומצם של מוצרים, עם הסבר ברור על השימושים, היתרונות והמגבלות של כל אחד.
            </p>
            <p className="hero-meta">נבחר ומתעדכן ידנית</p>
            <a className="hero-cta" href="#products">
              לצפייה במוצרים
              <span className="arrow" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        </div>
      </section>

      <SectionNav />

      <section id="products" className="module" aria-labelledby="products-heading">
        <div className="container index-layout">
          <div className="index-aside">
            <p className="eyebrow">קטלוג</p>
            <h2 id="products-heading" className="module-title">
              המוצרים
            </h2>
            <p>מוצרי AI שנבחרו ידנית. בחרו שורה כדי לקרוא עוד.</p>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </section>

      <section id="disclosure" className="module pull" aria-labelledby="disclosure-heading">
        <div className="container">
          <p className="eyebrow">שקיפות</p>
          <h2 id="disclosure-heading" className="sr-only">
            גילוי נאות
          </h2>
          <p className="pull-text reveal">
            חלק מהקישורים באתר הם קישורי שותפים. ייתכן שנקבל עמלה בעקבות רכישה דרכם.
          </p>
          <Link href="/legal/affiliate" className="link-draw">
            לגילוי הנאות המלא ←
          </Link>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
