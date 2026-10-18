import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { DemoNotice } from "@/components/DemoNotice";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";
import "../globals.css";
import "../public.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "מבחר מצומצם של מוצרי AI, עם הסבר על השימושים והמגבלות של כל אחד.",
};

// The public site is Hebrew and right-to-left. The admin area has its own root layout.
// connection() makes every public page render per request. A prerendered shell cannot carry
// the per-request CSP nonce, so Next.js's inline scripts would be blocked.
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="he" dir="rtl">
      <body>
        <DemoNotice />
        <header className="site-header">
          <div className="container header-grid">
            <nav aria-label="ניווט ראשי" className="header-nav">
              <Link href="/#products">המוצרים</Link>
              <Link href="/#disclosure">גילוי נאות</Link>
            </nav>
            <Link href="/" className="brand">
              {siteConfig.name}
            </Link>
            <Link href="/#contact" className="header-cta button button-light">
              יצירת קשר
            </Link>
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
