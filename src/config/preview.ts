import "server-only";

// Demo products are for local development and an explicitly enabled preview only.
// The flag must be set on purpose (DEMO_PREVIEW=1). It is never active in a Netlify production
// deployment. Demo content is never a fallback: when this flag is off, Supabase errors surface
// through the error boundary, not as demo cards.
export function isDemoPreviewEnabled(): boolean {
  return process.env.DEMO_PREVIEW === "1" && process.env.CONTEXT !== "production";
}
