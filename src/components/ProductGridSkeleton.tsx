// Loading state for the product grid: neutral tile placeholders, no text, no animation.
export function ProductGridSkeleton() {
  return (
    <ul className="tile-grid" aria-busy="true" aria-label="טוען מוצרים">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <div className="tile-skeleton" />
        </li>
      ))}
    </ul>
  );
}
