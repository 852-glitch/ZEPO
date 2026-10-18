import type { NextRequest } from "next/server";
import { resolveGo, type GoOutcome } from "@/lib/go";
import { createServiceClient } from "@/lib/supabase/service";

// Outbound links. The only server code that uses the service-role key.
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
  const supabase = createServiceClient();
  return resolveGo(
    slug,
    options,
    {
      lookupDestination: async (value) => {
        const { data, error } = await supabase
          .from("products")
          .select("destination_url")
          .eq("slug", value)
          .eq("is_published", true)
          .maybeSingle();
        if (error) throw new Error(error.message);
        return data?.destination_url ?? null;
      },
      recordClick: async (value) => {
        const { error } = await supabase.rpc("record_click", { p_slug: value });
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
