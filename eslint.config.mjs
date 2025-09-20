import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import pluginImportHelpers from "eslint-plugin-import-helpers";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    ignores: ["dist", "node_modules", "coverage"],
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      "import-helpers": pluginImportHelpers,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "import-helpers/order-imports": [
        "warn",
        {
          newlinesBetween: "ignore",
          groups: [
            ["/^@nestjs/", "module"],
            "/^@//",
            ["parent", "sibling", "index"],
          ],
          alphabetize: { order: "asc", ignoreCase: true },
        },
      ],
      "prettier/prettier": [
        "error",
        {
          "endOfLine": "auto",
          "bracketSpacing": true,
          "printWidth": 150,
          "semi": true,
          "singleQuote": false,
          "tabWidth": 2,
          "trailingComma": "all",
        }
      ],
    },
  },
];