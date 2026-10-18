import type { PublicProduct } from "@/types/product";

// Fictional demo products for the local preview only. Loaded only when DEMO_PREVIEW=1
// (see src/config/preview.ts). They never go into the database, never link anywhere,
// and never stand in for a failed Supabase query.
const base = {
  review: null,
  image_url: null,
  is_affiliate: false,
  is_published: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const DEMO_PRODUCTS: PublicProduct[] = [
  {
    ...base,
    id: "demo-1",
    slug: "demo-writing-helper",
    name: "דוגמה: עוזר כתיבה",
    description: "מוצר בדיוני לניסוח טקסטים קצרים ולעריכה לשונית.",
    display_order: 1,
  },
  {
    ...base,
    id: "demo-2",
    slug: "demo-meeting-notes",
    name: "דוגמה: מסכם פגישות",
    description: "מוצר בדיוני שמסכם הקלטות פגישות לנקודות עיקריות.",
    display_order: 2,
  },
  {
    ...base,
    id: "demo-3",
    slug: "demo-document-translator",
    name: "דוגמה: מתרגם מסמכים",
    description: "מוצר בדיוני לתרגום מסמכים תוך שמירה על המבנה.",
    display_order: 3,
  },
  {
    ...base,
    id: "demo-4",
    slug: "demo-image-cleaner",
    name: "דוגמה: מנקה תמונות",
    description: "מוצר בדיוני להסרת רקע ושיפור תמונות מוצר.",
    display_order: 4,
  },
  {
    ...base,
    id: "demo-5",
    slug: "demo-interview-coach",
    name: "דוגמה: מאמן ראיונות",
    description: "מוצר בדיוני לתרגול שאלות ראיון ומשוב כתוב.",
    display_order: 5,
  },
];
