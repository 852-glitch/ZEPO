// Loading state for the product grid: neutral card placeholders, no text, no animation.
export function ProductGridSkeleton() {
  return (
    <ul className="grid product-list" aria-busy="true" aria-label="טוען מוצרים">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <div className="card skeleton-card" />
        </li>
      ))}
    </ul>
  );
}
