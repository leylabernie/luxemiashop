import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", {
        allowConstantExport: true,
        // Stable helpers/hooks intentionally colocated with their shadcn-style
        // components. Whitelisting the named exports keeps Fast Refresh checks
        // active for every other non-component export.
        allowExportNames: [
          "badgeVariants",
          "buttonVariants",
          "navigationMenuTriggerStyle",
          "toast",
          "toggleVariants",
          "useAuth",
          "useFormField",
          "useSidebar",
        ],
      }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
