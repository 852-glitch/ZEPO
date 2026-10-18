// Root-level 404 for URLs outside the route groups. Without a root layout,
// Next.js requires this file to render its own <html> and <body>.
import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "הדף לא נמצא",
};

export default async function NotFound() {
  await connection();
  return (
    <html lang="he" dir="rtl">
      <body>
        <main className="container state">
          <h1>הדף לא נמצא</h1>
        </main>
      </body>
    </html>
  );
}
