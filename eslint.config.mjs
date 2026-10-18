import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // Verification build outputs (NEXT_DIST_DIR), not source.
    ".next-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated bundles and scratch output, not source.
    "coverage/**",
  ]),
]);

export default eslintConfig;
