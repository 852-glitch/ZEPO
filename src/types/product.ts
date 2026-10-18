// Shape of a product as the public site reads it. Columns match the anon grant in
// supabase/migrations/0002_hardening.sql: click_count and destination_url are never selected here.
export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  review: string | null;
  image_url: string | null;
  is_affiliate: boolean;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
