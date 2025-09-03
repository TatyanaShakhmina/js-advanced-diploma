import js from "@eslint/js";
import globals from "globals";

export default [
  {
    name: "root",
    files: ["**/*.js"],
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    plugins: {},
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off"
    },
  },

  {
    name: "webpack config (node)",
    files: ["webpack.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {

    },
  },
];
