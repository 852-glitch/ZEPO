import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { DemoNotice } from "@/components/DemoNotice";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/config/site";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: "מבחר מצומצם של מוצרי AI, עם הסבר על השימושים והמגבלות של כל אחד.",
};

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="he" dir="rtl">
      <body>
        <DemoNotice />
        <header className="site-header">
          <div className="container header-inner">
            <strong>{siteConfig.name}</strong>
            <nav aria-label="ניווט ראשי" className="header-nav">
              <Link href="/#products">המוצרים</Link>
              <Link href="/#contact">יצירת קשר</Link>
            </nav>
          </div>
        </header>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
