import type { NextRequest } from "next/server";
import { resolveGo, type GoOutcome } from "@/lib/go";
import { createPublicClient } from "@/lib/supabase/public";

// Outbound links. Redirect only: GET and HEAD never change a click count.
// Counting happens in POST /api/click, which the product page's button sends from the browser.
// The lookup uses the anon key through get_destination(), so no server secret is needed here.
// Responses are never cached, so a changed destination takes effect immediately.

export async function GET(_request: NextRequest, context: RouteContext<"/go/[slug]">) {
  const { slug } = await context.params;
  return toResponse(await handle(slug));
}

export async function HEAD(_request: NextRequest, context: RouteContext<"/go/[slug]">) {
  const { slug } = await context.params;
  return toResponse(await handle(slug));
}

async function handle(slug: string): Promise<GoOutcome> {
  return resolveGo(
    slug,
    { count: false },
    {
      lookupDestination: async (value) => {
        const { data, error } = await createPublicClient().rpc("get_destination", { p_slug: value });
        if (error) throw new Error(error.message);
        return (data as string | null) ?? null;
      },
      // Never called: count is false. Required by the shared resolver's type.
      recordClick: async () => undefined,
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
