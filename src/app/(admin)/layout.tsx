import type { Metadata } from "next";
import { connection } from "next/server";
import "../globals.css";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: LayoutProps<"/">) {
  // Every admin route renders per request, so its inline scripts get the per-request CSP nonce.
  await connection();
  return (
    <html lang="en" dir="ltr">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <strong>AI Products Showcase — Administration</strong>
          </div>
        </header>
        <main className="container admin-main">{children}</main>
      </body>
    </html>
  );
}
