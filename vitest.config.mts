import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": `${root}src`,
      // server-only throws outside a React server build. Tests import server modules directly.
      "server-only": `${root}tests/stubs/server-only.ts`,
    },
  },
  test: {
    environment: "node",
    // Local stack keys come from .env.local, so integration tests can reach the local database.
    env: loadEnv(mode, root, ""),
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next*/**"],
  },
}));
