import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type PendingCookie = { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] };

// Runs on every page request:
// 1. Sets a fresh nonce-based Content-Security-Policy.
// 2. On /admin routes, refreshes the Supabase session cookies before Server Components read them.
// Authorization is not decided here. requireAdmin() and RLS decide access.
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  }
  const supabaseOrigin = new URL(supabaseUrl).origin;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Scripts and styles: same origin plus this request's nonce only.
  // 'unsafe-eval' is development-only (React uses eval for better debugging stacks).
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' https:",
    "font-src 'self'",
    `connect-src 'self' ${supabaseOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const pendingCookies: PendingCookie[] = [];
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            pendingCookies.push({ name, value, options });
          }
        },
      },
    });
    // getUser() refreshes an expiring access token and reports the refreshed cookies.
    const { data: userData } = await supabase.auth.getUser();
    const pathname = request.nextUrl.pathname;
    const isLogin = pathname === "/admin/login";

    // First gate for /admin: a real 307 for signed-out and non-admin visitors, before any rendering.
    // The admin pages and server actions still run requireAdmin(), so this is never the only check.
    if (!isLogin) {
      const { data: isAdmin } = userData.user ? await supabase.rpc("is_admin") : { data: false };
      if (isAdmin !== true) {
        const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
        for (const { name, value, options } of pendingCookies) {
          redirect.cookies.set(name, value, options);
        }
        redirect.headers.set("Content-Security-Policy", csp);
        return redirect;
      }
    }
  }

  // Forward the refreshed cookies and the nonce to Server Components in this same request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", request.cookies.toString());
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Skip static assets and prefetch requests, which don't need the page CSP.
      source: "/((?!_next/static|_next/image|fonts/|images/|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
