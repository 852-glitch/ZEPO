"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  parseProductForm,
  readIntent,
  readProductForm,
  type Intent,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/admin/product-form";

// Every export below is a server action. Each one starts with requireAdmin(),
// which checks the user and is_admin() itself. Row-level security and column grants
// are still the enforcement; these checks give clear errors.

export type LoginState = { message?: string; email: string };

export type ProductFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  errors?: ProductFormErrors;
  values: ProductFormValues;
  // Set after a successful save: whether the product is now visible to visitors.
  published?: boolean;
  savedAt?: number;
};

const GENERIC_LOGIN_FAILURE = "Invalid email or password.";

// Sign-in is generic on purpose: wrong password, unknown email, and a non-admin account
// all return the same message.
export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Enter your email and password.", email };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { message: GENERIC_LOGIN_FAILURE, email };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    await supabase.auth.signOut();
    return { message: GENERIC_LOGIN_FAILURE, email };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Maps database errors to messages without exposing constraint names or SQL details.
function describeSaveError(code: string | undefined, values: ProductFormValues): ProductFormState {
  if (code === "23505") {
    return { status: "error", message: "Could not save.", errors: { slug: "This slug is already in use." }, values };
  }
  if (code === "42501") {
    return { status: "error", message: "You are not allowed to change products.", values };
  }
  if (code === "23514") {
    return {
      status: "error",
      message: "A value does not meet the database rules. Check the highlighted fields.",
      values,
    };
  }
  return { status: "error", message: "Could not save. Your changes are still in the form.", values };
}

export async function saveProduct(
  productId: string | null,
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();
  const values = readProductForm(formData);
  const intent: Intent = readIntent(formData);

  const parsed = parseProductForm(values, intent);
  if (!parsed.ok) {
    return {
      status: "error",
      message: intent === "publish" ? "Fix the highlighted fields before publishing." : "Fix the highlighted fields.",
      errors: parsed.errors,
      values,
    };
  }

  if (productId) {
    const { data: current, error: loadError } = await supabase
      .from("products")
      .select("slug, is_published")
      .eq("id", productId)
      .maybeSingle();

    if (loadError) {
      return { status: "error", message: "Could not load the product. Your changes are still in the form.", values };
    }
    if (!current) {
      return { status: "error", message: "This product no longer exists.", values };
    }

    // Changing the slug of a published product breaks existing /p/ and /go/ links.
    // The server requires the confirmation, not only the client-side checkbox.
    if (current.is_published && current.slug !== parsed.data.slug && !values.confirm_slug_change) {
      return {
        status: "error",
        message: "Confirm the slug change first.",
        errors: { confirm_slug_change: "Confirm that existing links to this product will break." },
        values,
      };
    }

    // The update writes only editable columns. click_count is never in parsed.data, so changing
    // the destination keeps the product's recorded clicks.
    const { error: updateError } = await supabase.from("products").update(parsed.data).eq("id", productId);
    if (updateError) {
      return describeSaveError(updateError.code, values);
    }
    return {
      status: "saved",
      message: intent === "publish" ? "Published." : "Saved as draft. Visitors cannot see it.",
      values: { ...values, confirm_slug_change: false },
      published: intent === "publish",
      savedAt: Date.now(),
    };
  }

  const { data: created, error: insertError } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (insertError || !created) {
    return describeSaveError(insertError?.code, values);
  }

  redirect(`/admin/products/${created.id}?created=${intent}`);
}

// Publish and unpublish from the list. Failures go back to the list as a notice.
export async function setPublished(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = String(formData.get("product_id") ?? "");
  const publish = formData.get("publish") === "true";

  if (!productId) {
    redirect("/admin?notice=publish-failed");
  }

  const { error } = await supabase
    .from("products")
    .update({ is_published: publish })
    .eq("id", productId);

  if (error) {
    redirect("/admin?notice=publish-failed");
  }
  redirect(`/admin?notice=${publish ? "published" : "unpublished"}`);
}
