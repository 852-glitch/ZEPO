import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AccessibilityShell } from "@/components/AccessibilityShell";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";
import "@multicloud-io/react-a11y-toolbar/style.css";
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
        <AccessibilityShell>
        {/* Decorative scroll progress bar. Shown only where scroll-driven animation is supported. */}
        <div className="scroll-progress" aria-hidden="true" />
        <header className="masthead">
          <div className="container masthead-inner">
            <Link href="/" className="wordmark">
              {siteConfig.name}
            </Link>
            <nav aria-label="ניווט ראשי" className="masthead-nav">
              <Link href="/#products" className="hide-small">
                המוצרים
              </Link>
              <Link href="/#disclosure" className="hide-small">
                גילוי נאות
              </Link>
              <Link href="/#contact" className="pill">
                הצעת מוצר
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <SiteFooter />
        </AccessibilityShell>
      </body>
    </html>
  );
}
