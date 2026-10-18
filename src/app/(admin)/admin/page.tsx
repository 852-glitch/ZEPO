import Link from "next/link";
import { setPublished, signOut } from "@/admin/actions";
import { SubmitButton } from "@/admin/SubmitButton";
import { requireAdmin } from "@/lib/admin";

const NOTICES: Record<string, string> = {
  published: "Product published.",
  unpublished: "Product unpublished.",
  "publish-failed":
    "Could not change the status. A product needs a description and a valid https destination URL before it can be published.",
};

const clickFormat = new Intl.NumberFormat("en-US");

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  is_published: boolean;
  is_affiliate: boolean;
};

// requireAdmin() runs on this page itself, not only in the layout.
export default async function AdminProductsPage(props: PageProps<"/admin">) {
  const search = await props.searchParams;
  const notice = typeof search.notice === "string" ? search.notice : undefined;
  const { supabase } = await requireAdmin();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, slug, name, display_order, is_published, is_affiliate")
    .order("display_order", { ascending: true })
    .order("slug", { ascending: true });
  if (productsError) {
    throw new Error("Could not load products.");
  }

  // Click totals come from the admin-only function. click_count is not selectable directly.
  const { data: totals, error: totalsError } = await supabase.rpc("admin_click_totals");
  if (totalsError) {
    throw new Error("Could not load click totals.");
  }
  const totalRows = (totals ?? []) as { id: string; click_count: number | string }[];
  const clicks = new Map(totalRows.map((row) => [row.id, Number(row.click_count)]));

  const rows = (products ?? []) as ProductRow[];

  return (
    <>
      <div className="admin-toolbar">
        <h1>Products</h1>
        <div className="admin-toolbar-actions">
          <Link className="button" href="/admin/products/new">
            Add product
          </Link>
          <form action={signOut}>
            <SubmitButton label="Sign out" variant="secondary" />
          </form>
        </div>
      </div>

      {notice !== undefined && NOTICES[notice] && (
        <p className="admin-message admin-message-ok" role="status">
          {NOTICES[notice]}
        </p>
      )}

      {rows.length === 0 ? (
        <p>No products yet. Add the first one.</p>
      ) : (
        <ul className="admin-rows">
          <li className="admin-row admin-row-head" aria-hidden="true">
            <span>Name</span>
            <span>Status</span>
            <span>Order</span>
            <span>Recorded clicks</span>
            <span>Actions</span>
          </li>
          {rows.map((row) => (
            <li className="admin-row" key={row.id}>
              <span>
                <strong>{row.name}</strong>
                <br />
                <code>{row.slug}</code>
                {row.is_affiliate && <span className="badge"> affiliate</span>}
              </span>
              <span data-label="Status">{row.is_published ? "Published" : "Draft"}</span>
              <span data-label="Order">{row.display_order}</span>
              <span data-label="Recorded clicks">{clickFormat.format(clicks.get(row.id) ?? 0)}</span>
              <span className="admin-row-actions" data-label="Actions">
                <Link href={`/admin/products/${row.id}`}>Edit</Link>
                <form action={setPublished}>
                  <input type="hidden" name="product_id" value={row.id} />
                  <input type="hidden" name="publish" value={row.is_published ? "false" : "true"} />
                  <SubmitButton label={row.is_published ? "Unpublish" : "Publish"} variant="secondary" />
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="field-hint">
        Recorded clicks are the total outbound clicks recorded through /go/slug across this product&apos;s destination history. They are not affiliate conversions, unique visitors, or purchases.
      </p>
    </>
  );
}
