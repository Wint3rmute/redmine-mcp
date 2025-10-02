# ESLint Configuration

This document describes the ESLint configuration that has been set up for this
TypeScript MCP server project.

## Configuration Overview

The ESLint setup uses the **legacy `.eslintrc.json`** format with comprehensive
TypeScript support and strict rules that complement the ultra-strict TypeScript
configuration.

## Installed Dependencies

The following ESLint packages are installed as dev dependencies:

- `eslint` - Core ESLint linter
- `@typescript-eslint/parser` - TypeScript parser for ESLint
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting rules
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier
  (if added later)
- `@types/eslint` - TypeScript definitions for ESLint

## Extended Configurations

The ESLint config extends several recommended rule sets:

- `eslint:recommended` - Core ESLint recommended rules
- `@typescript-eslint/recommended` - Basic TypeScript rules
- `@typescript-eslint/recommended-requiring-type-checking` - Rules requiring
  type information
- `@typescript-eslint/strict` - Strict TypeScript rules

## Key Rules Enabled

### TypeScript-Specific Rules

- **`@typescript-eslint/no-explicit-any`** - Prohibits `any` types (forces
  proper typing)
- **`@typescript-eslint/explicit-function-return-type`** - Requires explicit
  return types on functions
- **`@typescript-eslint/explicit-module-boundary-types`** - Requires explicit
  types on exported functions
- **`@typescript-eslint/consistent-type-imports`** - Enforces type-only imports
  for types
- **`@typescript-eslint/consistent-type-exports`** - Enforces type-only exports
  for types
- **`@typescript-eslint/prefer-readonly`** - Suggests readonly for
  never-modified properties

### Naming Conventions

Enforces consistent naming patterns:

- **Variables**: camelCase or UPPER_CASE (for constants)
- **Parameters**: camelCase (leading underscore allowed for unused)
- **Private members**: camelCase with required leading underscore
- **Types/Interfaces**: PascalCase (interfaces must NOT start with 'I')

### Code Quality Rules

- **`prefer-const`** - Use const for never-reassigned variables
- **`prefer-template`** - Use template literals instead of string concatenation
- **`object-shorthand`** - Use shorthand object properties
- **`no-var`** - Prohibit var declarations
- **`eqeqeq`** - Require strict equality (`===`)
- **`curly`** - Require curly braces for all control statements

### Code Style Rules

- **`@typescript-eslint/quotes`** - Enforce double quotes
- **`@typescript-eslint/semi`** - Require semicolons
- **`@typescript-eslint/indent`** - Enforce 2-space indentation
- **`no-console`** - Warn on console usage (except warn/error)

## NPM Scripts

Three linting scripts have been added to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "lint:check": "eslint src --ext .ts --max-warnings 0"
  }
}
```

- **`npm run lint`** - Check for linting issues
- **`npm run lint:fix`** - Automatically fix fixable issues
- **`npm run lint:check`** - Fail if any warnings exist (strict CI mode)

## Ignored Files/Patterns

ESLint ignores these files and directories:

- `node_modules/` - Dependencies
- `build/`, `dist/` - Build outputs
- `*.config.js`, `*.config.ts` - Configuration files
- `.env*` - Environment files
- Log files and coverage directories
- Test files (`*.test.ts`, `*.spec.ts`)

## Code Changes Made

To make the code compliant with the strict ESLint rules, the following changes
were made:

1. **Replaced `any` types** with proper TypeScript interfaces:
   - Created `GetIssuesArgs`, `GetProjectsArgs`, `CreateIssueArgs`, etc.
   - Added explicit return types to all functions

2. **Fixed property access** for strict index signatures:
   - Changed `params.property` to `params['property']` where needed

3. **Used type-only imports**:
   - Changed `import { AxiosInstance }` to `import { type AxiosInstance }`

4. **Proper type assertions**:
   - Used `as unknown as Type` for complex type conversions

## Benefits

This ESLint configuration provides:

- **Consistent code style** across the entire codebase
- **Early error detection** beyond what TypeScript catches
- **Enforced best practices** for TypeScript and modern JavaScript
- **Maintainability** through consistent naming and structure
- **Team collaboration** with shared coding standards
- **CI/CD integration** with the `lint:check` script

## Integration with TypeScript

The ESLint configuration perfectly complements the ultra-strict TypeScript
setup:

- ESLint handles code style and patterns
- TypeScript handles type safety and compilation
- Together they provide comprehensive code quality assurance

The project now has both **maximum type safety** (TypeScript) and **consistent
code quality** (ESLint) for a robust development experience.
