// Loading state for the product index: quiet row placeholders, no text, no motion.
export function ProductGridSkeleton() {
  return (
    <div className="index" aria-busy="true" aria-label="טוען מוצרים">
      {[0, 1, 2].map((i) => (
        <div key={i} className="index-skeleton" />
      ))}
    </div>
  );
}
