import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { 
      js,
      jsdoc,
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      // JSDoc rules for documentation requirements
      "jsdoc/require-jsdoc": ["error", {
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
        ]
      }],
      "jsdoc/require-description": "error",
      "jsdoc/require-param-description": "error", 
      "jsdoc/require-returns-description": "error",
      "jsdoc/require-param": "error",
      "jsdoc/require-returns": ["error", {
        forceRequireReturn: false,
        forceReturnsWithAsync: false
      }],
      "jsdoc/check-param-names": "error",
      "jsdoc/check-types": "error",
      "jsdoc/valid-types": "error",
    }
  },
  tseslint.configs.recommended,
]);
