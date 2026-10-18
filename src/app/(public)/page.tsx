import Link from "next/link";
import { Suspense } from "react";
import { ContactSection } from "@/components/ContactSection";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { ProductList } from "@/components/ProductList";
import { SectionDots } from "@/components/SectionDots";

// Layout follows a hero, a sticky section bar, then separated modules. The product grid
// streams in behind its own Suspense boundary.
export default function HomePage() {
  return (
    <main>
      <section className="hero on-dark" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-panel">
            <p className="eyebrow">מדריך מוצרי AI</p>
            <h1 id="hero-heading">מוצרי AI ששווה להכיר</h1>
            <p className="hero-lead">
              מבחר מצומצם של מוצרים, עם הסבר ברור על השימושים, היתרונות והמגבלות של כל אחד.
            </p>
            <a className="button" href="#products">
              לצפייה במוצרים
            </a>
          </div>
        </div>
      </section>

      <nav className="subnav" aria-label="ניווט בעמוד">
        <div className="container subnav-inner">
          <a href="#products">המוצרים</a>
          <a href="#disclosure">גילוי נאות</a>
          <a href="#contact">יצירת קשר</a>
          <a className="subnav-action" href="#contact">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            להצעת מוצר
          </a>
        </div>
      </nav>
      <SectionDots />

      <section id="products" className="module module-center" aria-labelledby="products-heading">
        <div className="container">
          <div className="module-head">
            <p className="eyebrow">קטלוג</p>
            <h2 id="products-heading" className="module-title">
              המוצרים
            </h2>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </section>

      <section id="disclosure" className="module module-soft" aria-labelledby="disclosure-heading">
        <div className="container disclosure-grid">
          <div>
            <p className="eyebrow">שקיפות</p>
            <h2 id="disclosure-heading" className="module-title">
              גילוי נאות
            </h2>
          </div>
          <div>
            <p className="disclosure-text">
              חלק מהקישורים באתר הם קישורי שותפים. ייתכן שנקבל עמלה בעקבות רכישה דרכם.
            </p>
            <Link href="/legal/affiliate">לגילוי הנאות המלא ←</Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
