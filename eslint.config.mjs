import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import globals from "globals";

export default defineConfig(
  globalIgnores(["**/node_modules/**", "**/dist/**", "**/coverage/**"]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["packages/backend/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["packages/frontend/**/*.{ts,vue}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
);
