"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type MouseEvent } from "react";
import { saveProduct, type ProductFormState } from "@/admin/actions";
import { SubmitButton } from "@/admin/SubmitButton";
import { LIMITS, charCount, type ProductFormValues } from "@/admin/product-form";
import { ProductImage } from "@/components/ProductImage";

type Props = {
  productId: string | null;
  initial: ProductFormValues;
  // Set when the page was opened right after creating a product. Shown only until the next save.
  createdAs?: "draft" | "publish" | null;
  // The slug and publication state of the product when the page loaded.
  originalSlug: string;
  originalPublished: boolean;
};

export function ProductForm({ productId, initial, originalSlug, originalPublished, createdAs }: Props) {
  const initialState: ProductFormState = { status: "idle", values: initial };
  const [state, formAction] = useActionState(saveProduct.bind(null, productId), initialState);

  // Controlled fields: counters, the image preview, and the slug confirmation.
  const [slug, setSlug] = useState(initial.slug);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [review, setReview] = useState(initial.review);
  const [imageUrl, setImageUrl] = useState(initial.image_url);
  const [dirty, setDirty] = useState(false);

  // Status and slug as they are saved on the server, not as they are typed.
  const savedPublished = state.status === "saved" ? Boolean(state.published) : originalPublished;
  const savedSlug = state.status === "saved" ? state.values.slug : originalSlug;

  // A successful save clears the unsaved-changes state. Adjusting state during render (not in an
  // effect) is the React-documented pattern for resetting state when a value changes.
  const [seenSavedAt, setSeenSavedAt] = useState(state.savedAt);
  if (state.savedAt !== seenSavedAt) {
    setSeenSavedAt(state.savedAt);
    if (state.status === "saved") {
      setDirty(false);
    }
  }

  // Warn before the browser discards unsaved edits (reload, close, or external navigation).
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const slugChanged = savedPublished && slug !== savedSlug;
  const errors = state.errors ?? {};

  function confirmLeave(event: MouseEvent<HTMLAnchorElement>) {
    if (dirty && !window.confirm("Leave without saving your changes?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="admin-form product-form" onChange={() => setDirty(true)}>
      <p>
        <Link href="/admin" onClick={confirmLeave}>
          ← Back to products
        </Link>
      </p>

      <p className="product-status">
        Status: <strong>{savedPublished ? "Published" : "Draft"}</strong>
        {savedPublished ? " — visible on the public site." : " — not visible to visitors."}
        {savedPublished && (
          <>
            {" "}
            <Link href={`/p/${savedSlug}`} target="_blank" rel="noopener noreferrer">
              Open public page
            </Link>
          </>
        )}
      </p>

      {state.status === "idle" && createdAs && (
        <p className="admin-message admin-message-ok" role="status">
          {createdAs === "publish" ? "Product created and published." : "Product created as a draft."}
        </p>
      )}

      {state.status === "saved" && (
        <div className="admin-message admin-message-ok" role="status">
          <p>{state.message ?? "Saved."}</p>
          {savedPublished && (
            <Link href={`/p/${state.values.slug}`} target="_blank" rel="noopener noreferrer">
              Open public page
            </Link>
          )}
        </div>
      )}
      {state.status === "error" && state.message && (
        <p className="admin-message admin-message-error" role="alert">
          {state.message}
        </p>
      )}

      <label>
        Name
        <input
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-describedby="name-hint"
        />
        <span id="name-hint" className="field-hint">
          {charCount(name)} / {LIMITS.name} characters. Required, including for drafts.
        </span>
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label>
        Slug
        <input
          name="slug"
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          aria-describedby="slug-hint"
          autoComplete="off"
          spellCheck={false}
        />
        <span id="slug-hint" className="field-hint">
          Lowercase Latin letters, digits, and hyphens, 2–80 characters. Example: ai-writing-helper. Used in
          /p/slug and /go/slug.
        </span>
        {errors.slug && <span className="field-error">{errors.slug}</span>}
      </label>

      {slugChanged && (
        <label className="confirm-box">
          <input name="confirm_slug_change" type="checkbox" required />
          This product is published. Changing the slug breaks existing links to it. I understand.
          {errors.confirm_slug_change && <span className="field-error">{errors.confirm_slug_change}</span>}
        </label>
      )}

      <label>
        Short description
        <textarea
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-describedby="description-hint"
        />
        <span id="description-hint" className="field-hint">
          Required to publish. {charCount(description)} / {LIMITS.description} characters. Plain text only.
        </span>
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <label>
        Review (optional)
        <textarea
          name="review"
          rows={6}
          value={review}
          onChange={(event) => setReview(event.target.value)}
          aria-describedby="review-hint"
        />
        <span id="review-hint" className="field-hint">
          Optional. {charCount(review)} / {LIMITS.review} characters. Plain text; line breaks are kept. Write only
          what has been verified. Do not present a product&apos;s own claims as our experience, and do not say we
          tested a product unless we did.
        </span>
        {errors.review && <span className="field-error">{errors.review}</span>}
      </label>

      <label>
        Image URL (optional, https)
        <input
          name="image_url"
          type="url"
          inputMode="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          aria-describedby="image-hint"
        />
        <span id="image-hint" className="field-hint">
          Leave empty to show the placeholder. The placeholder also shows if the image fails to load.
        </span>
        {errors.image_url && <span className="field-error">{errors.image_url}</span>}
      </label>
      <div className="image-preview">
        <ProductImage src={imageUrl || null} alt={name || "Product image preview"} />
      </div>

      <label>
        Destination URL (https)
        <input
          name="destination_url"
          type="url"
          inputMode="url"
          defaultValue={state.values.destination_url}
          aria-describedby="destination-hint"
        />
        <span id="destination-hint" className="field-hint">
          Required to publish. Where /go/slug sends visitors. Change it at any time without redeploying; the
          product&apos;s recorded clicks are kept.
        </span>
        {errors.destination_url && <span className="field-error">{errors.destination_url}</span>}
      </label>

      <label className="checkbox-row">
        <input
          name="is_affiliate"
          type="checkbox"
          defaultChecked={state.values.is_affiliate}
          aria-describedby="affiliate-hint"
        />
        This is an affiliate link
      </label>
      <span id="affiliate-hint" className="field-hint">
        Check only if this destination is an affiliate link. Leave it unchecked for an ordinary product URL.
      </span>

      <label>
        Display order
        <input
          name="display_order"
          type="number"
          min={0}
          max={9999}
          step={1}
          defaultValue={state.values.display_order}
          aria-describedby="order-hint"
        />
        <span id="order-hint" className="field-hint">
          Lower numbers appear first on the home page.
        </span>
        {errors.display_order && <span className="field-error">{errors.display_order}</span>}
      </label>

      <div className="form-actions">
        <SubmitButton name="intent" value="draft" label="Save draft" variant="secondary" />
        <SubmitButton
          name="intent"
          value="publish"
          label={savedPublished ? "Save changes (keep published)" : "Save and publish"}
        />
      </div>
      {savedPublished && (
        <p className="field-hint">Saving as a draft removes the product from the public site.</p>
      )}
    </form>
  );
}
