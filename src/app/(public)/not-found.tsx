import Link from "next/link";
import { connection } from "next/server";

// Shown inside the public layout for unknown and unpublished product slugs.
export default async function PublicNotFound() {
  await connection();
  return (
    <main className="container state">
      <h1>הדף לא נמצא</h1>
      <p>
        <Link href="/#products">לכל המוצרים</Link>
      </p>
    </main>
  );
}
