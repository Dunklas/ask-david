// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 11,
    },
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": "warn",
    },
  },
  {
    ignores: ['dist', 'eslint.config.js']
  }
);
