import type { NextRequest } from "next/server";
import { resolveGo, type GoOutcome } from "@/lib/go";
import { createPublicClient } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";

// Outbound links. The destination lookup uses the anon key through get_destination(), so a
// missing or wrong service-role key cannot block the redirect. Only the click count uses the
// service-role key, and a failed count never blocks the redirect (see src/lib/go.ts).
// Responses are never cached, so a changed destination takes effect immediately.

export async function GET(_request: NextRequest, context: RouteContext<"/go/[slug]">) {
  const { slug } = await context.params;
  return toResponse(await handle(slug, { count: true }));
}

// HEAD resolves the destination but does not count. Link previews and crawlers use HEAD.
export async function HEAD(_request: NextRequest, context: RouteContext<"/go/[slug]">) {
  const { slug } = await context.params;
  return toResponse(await handle(slug, { count: false }));
}

async function handle(slug: string, options: { count: boolean }): Promise<GoOutcome> {
  return resolveGo(
    slug,
    options,
    {
      lookupDestination: async (value) => {
        const { data, error } = await createPublicClient().rpc("get_destination", { p_slug: value });
        if (error) throw new Error(error.message);
        return (data as string | null) ?? null;
      },
      // Created here, not in handle(), so a missing key becomes a logged failed count, not a 500.
      recordClick: async (value) => {
        const { error } = await createServiceClient().rpc("record_click", { p_slug: value });
        if (error) throw new Error(error.message);
      },
      log: (message) => console.error(message),
    },
  );
}

function toResponse(outcome: GoOutcome): Response {
  const headers = { "Cache-Control": "no-store" };
  switch (outcome.kind) {
    case "redirect":
      return new Response(null, {
        status: 302,
        headers: { ...headers, Location: outcome.location },
      });
    case "not-found":
      return new Response("הדף לא נמצא", {
        status: 404,
        headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
      });
    case "unavailable":
      return new Response("השירות אינו זמין כרגע. נסו שוב מאוחר יותר.", {
        status: 503,
        headers: { ...headers, "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
      });
  }
}
