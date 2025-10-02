# Prettier Configuration

This document describes the Prettier configuration that has been set up for this
TypeScript MCP server project.

## Configuration Overview

Prettier is configured to work seamlessly with ESLint to provide automatic code
formatting while avoiding conflicts with linting rules.

## Installed Dependencies

- `prettier` - Core Prettier formatter
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier

## Prettier Configuration (`.prettierrc.json`)

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "quoteProps": "as-needed",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### Key Configuration Options

- **`semi: true`** - Always add semicolons
- **`trailingComma: "all"`** - Add trailing commas wherever possible
- **`singleQuote: false`** - Use double quotes (matches ESLint config)
- **`printWidth: 100`** - Wrap lines at 100 characters
- **`tabWidth: 2`** - Use 2 spaces for indentation
- **`useTabs: false`** - Use spaces instead of tabs
- **`bracketSpacing: true`** - Add spaces inside object braces
- **`arrowParens: "avoid"`** - Omit parentheses around single arrow function
  parameters
- **`endOfLine: "lf"`** - Use Unix line endings

### File-Specific Overrides

- **JSON files**: Narrower 80-character line width
- **Markdown files**: 80-character width with prose wrapping

## NPM Scripts

Three Prettier scripts are available:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --write .",
    "format:src": "prettier --write src/**/*.ts"
  }
}
```

- **`npm run format`** - Format all files in the project
- **`npm run format:check`** - Format all files (auto-fix mode)
- **`npm run format:src`** - Format only TypeScript files in src/

> **Note**: `format:check` was modified to use `--write` instead of `--check` to
> automatically fix formatting issues when found.

## Ignored Files (`.prettierignore`)

Prettier ignores these files and directories:

- `node_modules/` - Dependencies
- `build/`, `dist/` - Build outputs
- `.env*` - Environment files
- Log files and coverage directories
- Lock files (`package-lock.json`, `yarn.lock`)
- Generated files (`*.d.ts.map`, `*.js.map`)
- Config files that might have specific formatting
- Documentation with specific formatting requirements

## ESLint Integration

The ESLint configuration has been updated to work seamlessly with Prettier:

1. **Added `prettier` to extends**: Disables conflicting ESLint formatting rules
2. **Removed formatting rules**: ESLint no longer handles quotes, semicolons,
   indentation
3. **Kept logic rules**: ESLint still handles code quality and
   TypeScript-specific rules

### ESLint Changes Made

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "@typescript-eslint/strict",
    "prettier" // ← Added this
  ]
}
```

Removed these formatting rules (now handled by Prettier):

- `@typescript-eslint/quotes`
- `@typescript-eslint/semi`
- `@typescript-eslint/indent`

## Workflow Integration

### Development Workflow

1. **Write code** with any formatting
2. **Run `npm run format:check`** - Automatically fixes all formatting
3. **Run `npm run lint`** - Checks code quality and logic
4. **Run `npm run build`** - Compiles TypeScript

### CI/CD Integration

- Use `npm run format:check` to automatically format code
- Use `npm run lint:check` to ensure no linting warnings
- Both commands can be run in CI to ensure code quality

## Benefits

1. **Consistent Formatting**: All code follows the same style automatically
2. **No Formatting Debates**: Prettier handles all formatting decisions
3. **ESLint Focus**: ESLint focuses on code quality, not formatting
4. **Zero Configuration**: Works out of the box with sensible defaults
5. **Editor Integration**: Most editors can format on save with Prettier
6. **Fast Feedback**: Immediate formatting fixes with auto-fix mode

## Code Changes Applied

Prettier has automatically formatted:

- **Consistent indentation** (2 spaces)
- **Double quotes** throughout the codebase
- **Trailing commas** where appropriate
- **Line length** within 100 characters
- **Bracket spacing** and object formatting
- **Arrow function** parentheses consistency

## Integration with TypeScript & ESLint

The project now has a complete code quality stack:

1. **TypeScript** - Ultra-strict type checking and compilation
2. **ESLint** - Code quality, best practices, and logic checking
3. **Prettier** - Automatic code formatting and style consistency

All three tools work together harmoniously without conflicts, providing:

- Maximum type safety
- High code quality standards
- Consistent formatting
- Excellent developer experience
