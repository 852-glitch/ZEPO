"use client";

// Admin error boundary, in English. It never shows a database error message.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section>
      <h1>Something went wrong</h1>
      <p>The page could not be loaded. Your saved data has not changed.</p>
      <button className="button" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
