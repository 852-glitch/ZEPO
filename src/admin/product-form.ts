// Shared product form rules. Plain module, no server-only code, so it runs in tests and in the
// client editor. The database enforces the same limits (0001–0003), and those always win.

export const SLUG_PATTERN = /^[a-z0-9-]{2,80}$/;
export const LIMITS = { name: 120, description: 2000, review: 2000 } as const;

// "draft" saves without publishing. Drafts need only a name and slug.
// "publish" makes the product visible, so it needs a description and a valid destination too.
export type Intent = "draft" | "publish";

// Strings as the form submits them. Echoed back so the editor keeps what the user typed.
export type ProductFormValues = {
  slug: string;
  name: string;
  description: string;
  review: string;
  image_url: string;
  destination_url: string;
  is_affiliate: boolean;
  display_order: string;
  confirm_slug_change: boolean;
};

// The columns the admin may write. click_count and updated_at are never here.
export type ProductInput = {
  slug: string;
  name: string;
  description: string;
  review: string | null;
  image_url: string | null;
  destination_url: string | null;
  is_affiliate: boolean;
  display_order: number;
  is_published: boolean;
};

export type ProductFormField = keyof ProductFormValues | "form";
export type ProductFormErrors = Partial<Record<ProductFormField, string>>;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  slug: "",
  name: "",
  description: "",
  review: "",
  image_url: "",
  destination_url: "",
  is_affiliate: false,
  display_order: "0",
  confirm_slug_change: false,
};

// Counts code points, not UTF-16 units, so the count matches Postgres char_length for Hebrew and emoji.
export function charCount(text: string): number {
  return [...text].length;
}

export function isHttpsUrl(value: string): boolean {
  if (/\s/.test(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function readProductForm(formData: FormData): ProductFormValues {
  const text = (key: string) => String(formData.get(key) ?? "");
  return {
    slug: text("slug").trim().toLowerCase(),
    name: text("name").trim(),
    description: text("description").trim(),
    review: text("review").trim(),
    image_url: text("image_url").trim(),
    destination_url: text("destination_url").trim(),
    is_affiliate: formData.get("is_affiliate") === "on",
    display_order: text("display_order").trim(),
    confirm_slug_change: formData.get("confirm_slug_change") === "on",
  };
}

// Reads the save button that was clicked. Anything other than "publish" is treated as a draft.
export function readIntent(formData: FormData): Intent {
  return formData.get("intent") === "publish" ? "publish" : "draft";
}

export type ParseResult =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: ProductFormErrors };

export function parseProductForm(values: ProductFormValues, intent: Intent): ParseResult {
  const errors: ProductFormErrors = {};
  const publish = intent === "publish";

  if (!SLUG_PATTERN.test(values.slug)) {
    errors.slug = "Use 2–80 lowercase Latin letters, digits, or hyphens, for example ai-writing-helper.";
  }

  const nameLength = charCount(values.name);
  if (nameLength < 1 || nameLength > LIMITS.name) {
    errors.name = `Name must be 1–${LIMITS.name} characters.`;
  }

  const descriptionLength = charCount(values.description);
  if (publish && descriptionLength < 1) {
    errors.description = "A description is required to publish.";
  } else if (descriptionLength > LIMITS.description) {
    errors.description = `Description must be at most ${LIMITS.description} characters.`;
  }

  if (charCount(values.review) > LIMITS.review) {
    errors.review = `Review must be at most ${LIMITS.review} characters.`;
  }

  if (values.image_url && !isHttpsUrl(values.image_url)) {
    errors.image_url = "Image URL must be a full https:// address with no spaces.";
  }

  if (!values.destination_url) {
    if (publish) {
      errors.destination_url = "A destination URL is required to publish.";
    }
  } else if (!isHttpsUrl(values.destination_url)) {
    errors.destination_url = "Destination URL must be a full https:// address with no spaces.";
  }

  const order = Number(values.display_order);
  if (!/^-?\d+$/.test(values.display_order) || !Number.isSafeInteger(order) || order < 0 || order > 9999) {
    errors.display_order = "Display order must be a whole number from 0 to 9999.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      slug: values.slug,
      name: values.name,
      description: values.description,
      review: values.review || null,
      image_url: values.image_url || null,
      destination_url: values.destination_url || null,
      is_affiliate: values.is_affiliate,
      display_order: order,
      is_published: publish,
    },
  };
}
