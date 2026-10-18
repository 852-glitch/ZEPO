import { describe, expect, it } from "vitest";
import {
  charCount,
  EMPTY_PRODUCT_FORM,
  isHttpsUrl,
  LIMITS,
  parseProductForm,
  type Intent,
  type ProductFormValues,
} from "@/admin/product-form";

const complete: ProductFormValues = {
  ...EMPTY_PRODUCT_FORM,
  slug: "ai-writer",
  name: "עוזר כתיבה",
  description: "תיאור קצר.",
  destination_url: "https://example.com/writer",
  display_order: "3",
};

const draft: Intent = "draft";
const publish: Intent = "publish";

describe("drafts", () => {
  it("save with only a name and slug: no review, image, description, or destination", () => {
    const result = parseProductForm({ ...EMPTY_PRODUCT_FORM, slug: "ai-writer", name: "עוזר" }, draft);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.is_published).toBe(false);
      expect(result.data.destination_url).toBeNull();
      expect(result.data.review).toBeNull();
      expect(result.data.image_url).toBeNull();
    }
  });

  it("still require a name and a valid slug", () => {
    expect(parseProductForm({ ...complete, name: "" }, draft).ok).toBe(false);
    expect(parseProductForm({ ...complete, slug: "Bad_Slug" }, draft).ok).toBe(false);
  });

  it("reject a destination that is present but not https", () => {
    const result = parseProductForm({ ...complete, destination_url: "http://example.com" }, draft);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.destination_url).toBeDefined();
  });
});

describe("publishing", () => {
  it("accepts a complete product and marks it published", () => {
    const result = parseProductForm(complete, publish);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.is_published).toBe(true);
  });

  it("requires a destination URL", () => {
    const result = parseProductForm({ ...complete, destination_url: "" }, publish);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.destination_url).toBe("A destination URL is required to publish.");
  });

  it("requires a description", () => {
    const result = parseProductForm({ ...complete, description: "" }, publish);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.description).toBe("A description is required to publish.");
  });

  it("does not require a review or an image", () => {
    expect(parseProductForm({ ...complete, review: "", image_url: "" }, publish).ok).toBe(true);
  });
});

describe("field rules", () => {
  it.each(["a", "bad_slug", "sp ace", "x".repeat(81)])("rejects slug %j", (slug) => {
    expect(parseProductForm({ ...complete, slug }, publish).ok).toBe(false);
  });

  it("accepts a two-character lowercase slug", () => {
    expect(parseProductForm({ ...complete, slug: "ab" }, publish).ok).toBe(true);
  });

  it.each([
    "http://example.com",
    "javascript:alert(1)",
    "https://exa mple.com",
    "ftp://example.com",
    "example.com",
  ])("rejects non-https destination %j", (destination) => {
    expect(parseProductForm({ ...complete, destination_url: destination }, publish).ok).toBe(false);
  });

  it("rejects an http image URL but accepts an empty one", () => {
    expect(parseProductForm({ ...complete, image_url: "http://example.com/a.png" }, publish).ok).toBe(false);
    expect(parseProductForm({ ...complete, image_url: "" }, publish).ok).toBe(true);
  });

  it.each([
    ["-1", false],
    ["1.5", false],
    ["abc", false],
    ["0", true],
    ["9999", true],
    ["10000", false],
  ])("display order %j valid=%s", (order, expected) => {
    expect(parseProductForm({ ...complete, display_order: order }, publish).ok).toBe(expected);
  });

  it("counts code points, so an emoji is one character", () => {
    expect(parseProductForm({ ...complete, description: "😀".repeat(LIMITS.description) }, publish).ok).toBe(true);
    expect(parseProductForm({ ...complete, description: "😀".repeat(LIMITS.description + 1) }, publish).ok).toBe(false);
  });

  it("rejects a name over the limit", () => {
    expect(parseProductForm({ ...complete, name: "א".repeat(LIMITS.name + 1) }, draft).ok).toBe(false);
  });

  it("only produces editable columns, never click_count or updated_at", () => {
    const result = parseProductForm(complete, publish);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.data).sort()).toEqual(
        [
          "description",
          "destination_url",
          "display_order",
          "image_url",
          "is_affiliate",
          "is_published",
          "name",
          "review",
          "slug",
        ].sort(),
      );
    }
  });
});

describe("helpers", () => {
  it("charCount counts Hebrew letters and emoji as one character each", () => {
    expect(charCount("שלום")).toBe(4);
    expect(charCount("😀😀")).toBe(2);
    expect(charCount("")).toBe(0);
  });

  it("isHttpsUrl requires https and no whitespace", () => {
    expect(isHttpsUrl("https://example.com/path?q=1")).toBe(true);
    expect(isHttpsUrl("https://example.com/with space")).toBe(false);
    expect(isHttpsUrl("HTTP://example.com")).toBe(false);
    expect(isHttpsUrl("not a url")).toBe(false);
  });
});
