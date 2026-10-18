import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The running preview serves .next. Verification builds set NEXT_DIST_DIR so they cannot overwrite it.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Cache Components is off on purpose. With it on, notFound() and redirects streamed after a
  // 200 response, so /p/missing returned 200 instead of 404. Every public and admin route opts
  // into request-time rendering with connection(), which the per-request CSP nonce needs.
  poweredByHeader: false,
  async headers() {
    // Content-Security-Policy is set per request in src/proxy.ts, because it needs a nonce.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
