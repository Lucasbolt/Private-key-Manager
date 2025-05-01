import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["build/**", "coverage/**", "tests/**", "**/desktop/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      js,
      import: importPlugin,
    },
    extends: ["js/recommended"],
    rules: {
      "import/extensions": ["error", 'ignorePackages', {
        js: "always",
        jsx: "always",
        ts: "always",
        tsx: "always",
        mjs: "always",
        cjs: "always",
      }],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
]);