import { NextResponse, type NextRequest } from "next/server";
import { SLUG_PATTERN } from "@/lib/go";
import { createServiceClient } from "@/lib/supabase/service";

// Counts one outbound button interaction. The browser sends at most one per product per 24 hours
// (see src/lib/click-dedupe.ts). record_click counts only published products and returns null
// otherwise. Only this route and /go use the service-role key, and only here for the count.
// Nothing about the visitor is logged: no IP address, headers, or user data.

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  let slug: unknown;
  try {
    const body = (await request.json()) as { slug?: unknown };
    slug = body.slug;
  } catch {
    return new NextResponse(null, { status: 400, headers: NO_STORE });
  }
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
    return new NextResponse(null, { status: 400, headers: NO_STORE });
  }

  try {
    const { data, error } = await createServiceClient().rpc("record_click", { p_slug: slug });
    if (error) {
      console.error(`click: count failed: ${error.message}`);
      return new NextResponse(null, { status: 503, headers: NO_STORE });
    }
    if (data === null) {
      return new NextResponse(null, { status: 404, headers: NO_STORE });
    }
    return new NextResponse(null, { status: 204, headers: NO_STORE });
  } catch (error) {
    console.error(`click: count failed: ${error instanceof Error ? error.message : "unknown error"}`);
    return new NextResponse(null, { status: 503, headers: NO_STORE });
  }
}
