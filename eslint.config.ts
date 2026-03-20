import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import tsparser from "@typescript-eslint/parser";

export default defineConfig([
  {
    files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    ignores: ["tests/**", "out/**"],
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      "no-console": "warn",
      camelcase: ["warn", { properties: "never" }],
    },
  },
]);
