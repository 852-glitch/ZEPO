import { isDemoPreviewEnabled } from "@/config/preview";

// Visible on every page while demo content is on, so a preview can't be mistaken for real data.
export function DemoNotice() {
  if (!isDemoPreviewEnabled()) {
    return null;
  }
  return (
    <div className="demo-notice" role="status">
      תצוגה מקדימה — מוצרים לדוגמה
    </div>
  );
}
