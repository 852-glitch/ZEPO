"use client";

// Shown when the product query fails. A database error is never shown as an empty list
// or as demo products.
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container state">
      <h1>לא הצלחנו לטעון את המוצרים</h1>
      <p>נסו שוב בעוד רגע.</p>
      <button className="button" type="button" onClick={reset}>
        נסו שוב
      </button>
    </main>
  );
}
