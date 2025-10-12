import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Global ignores - applies to all configurations
  {
    ignores: ["build/**", "dist/**", "docs/**", "node_modules/**", "*.config.js", "coverage/**"],
  },
  // Configuration for source files
  {
    files: ["src/**/*.{ts,mts,cts}"],
    plugins: {
      js,
      jsdoc,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // JSDoc rules for documentation requirements
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false, // Optional for arrow functions
            FunctionExpression: true,
          },
          contexts: [
            // Require JSDoc for exported functions
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportDefaultDeclaration > FunctionDeclaration",
            // Require JSDoc for class methods (public ones)
            "MethodDefinition[accessibility='public']",
            "MethodDefinition:not([accessibility])", // Default is public
          ],
        },
      ],
      "jsdoc/require-description": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-returns": [
        "error",
        {
          forceRequireReturn: false,
          forceReturnsWithAsync: false,
        },
      ],
      "jsdoc/check-param-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/valid-types": "error",
    },
  },
  // Configuration for test files - more relaxed rules
  {
    files: ["test/**/*.{ts,mts,cts}"],
    plugins: {
      js,
      jsdoc,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Require JSDoc for test helper functions
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false, // No JSDoc required for test methods
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false, // No JSDoc required for inline test functions
          },
        },
      ],
      "jsdoc/require-description": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-returns": [
        "error",
        {
          forceRequireReturn: false,
          forceReturnsWithAsync: false,
        },
      ],
    },
  },
  tseslint.configs.recommended,
]);
