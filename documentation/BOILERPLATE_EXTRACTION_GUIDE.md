# Boilerplate Extraction Guide

This document lists all files and folders to copy from this repository to set up a new boilerplate application with the same development tooling, linting, architecture validation, and pre-commit hooks.

## 1. Cursor Commands & Rules (Entire Folders)

### `.cursor/commands/` - All files
Copy the entire folder including:
- `architecture-repair2.md`
- `check-simple.md`
- `check.md`
- `debug.md`
- `finish2.md`
- `optimize2.md`
- `review.md`
- `stepback.md`
- `archive/` folder (if needed):
  - `archive/debug-rich-text-save.md`
  - `archive/optimize-examples.md`
  - `archive/optimize.md`

### `.cursor/rules/` - All files
Copy the entire folder including:
- `README.md`
- `INDEX.md`
- `architecture/RULE.md`
- `cloud-functions/RULE.md`
- `code-style/RULE.md`
- `database/RULE.md`
- `debugging/RULE.md`
- `file-placement/RULE.md`
- `project-specific/RULE.md`
- `security/RULE.md`
- `testing/RULE.md`
- `workflow/RULE.md`

## 2. Husky & Pre-commit Setup

### `.husky/` folder
Copy the entire `.husky/` folder including:
- `.husky/pre-commit` - Main pre-commit hook script
- `.husky/_/` - Husky internal files (all files in this directory)

### Pre-commit Hook Script
The `.husky/pre-commit` file contains:
- Linting via lint-staged
- Running tests (`pnpm test:run`)
- Type checking (`pnpm type-check`)
- Architecture validation (`pnpm validate:structure` and `pnpm arch:check`)

## 3. Configuration Files

### ESLint Configuration
- `.eslintrc.json` - Main ESLint configuration with boundaries rules, complexity checks, import ordering
- `.eslintignore` - Files/folders to ignore during linting

### Dependency Cruiser (Architecture Validation)
- `.dependency-cruiser.js` - Dependency graph validation rules
- `.dependency-cruiser-baseline.json` - Baseline for dependency cruiser (if exists)

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration with path aliases
- `tsconfig.lib.json` - Library build TypeScript configuration (if exists)

### Vite Configuration
- `vite.config.ts` - Vite build configuration with path aliases, test setup, proxy config

### Project Structure Configuration
- `projectStructure.config.js` - Defines allowed file/folder structure (used by validator)

## 4. Scripts Folder

### `scripts/` folder - Copy these files:
- `project-structure-validator.js` - Validates project structure against config
- `lint-safe.ps1` - PowerShell linting script (if using Windows)
- `package.json` - Scripts folder dependencies (if exists)

**Note:** Other scripts in this folder (`convert-quotes.js`, `migrateFirestore.js`, `verifyMigration.js`, `serviceAccount.json`) are project-specific and may not be needed for boilerplate.

## 5. Package.json Configuration

### Required Scripts Section
Add these scripts to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "gts lint",
    "lint:fix": "gts fix",
    "type-check": "tsc --noEmit",
    "arch:check": "depcruise --config .dependency-cruiser.js src",
    "arch:check:ci": "depcruise --config .dependency-cruiser.js --output-type err-long src",
    "arch:graph": "depcruise --config .dependency-cruiser.js --output-type dot src | dot -T svg > architecture-graph.svg",
    "arch:graph:html": "depcruise --config .dependency-cruiser.js --output-type html src > architecture-report.html",
    "arch:validate": "pnpm lint && pnpm arch:check",
    "arch:baseline": "depcruise --config .dependency-cruiser.js --output-type baseline src > .dependency-cruiser-baseline.json",
    "lint:arch": "eslint src --rule 'boundaries/element-types: error'",
    "validate:structure": "node scripts/project-structure-validator.js",
    "validate:structure:json": "node scripts/project-structure-validator.js --format=json",
    "test:run": "vitest run"
  }
}
```

### Required DevDependencies
Add these to `package.json` devDependencies:

```json
{
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^16.2.7",
    "gts": "^6.0.2",
    "dependency-cruiser": "^17.3.6",
    "eslint": "^8.55.0",
    "eslint-plugin-boundaries": "^5.3.1",
    "eslint-plugin-import": "^2.32.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.0",
    "eslint-plugin-sonarjs": "^3.0.5",
    "eslint-plugin-unused-imports": "^4.3.0",
    "eslint-import-resolver-typescript": "^3.6.1",
    "@typescript-eslint/eslint-plugin": "^5.62.0",
    "@typescript-eslint/parser": "^5.62.0",
    "minimatch": "^10.0.1"
  }
}
```

### Lint-Staged Configuration
Add this to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "eslint --rule 'boundaries/element-types: error'"
    ],
    "projectStructure.config.js": [
      "pnpm validate:structure"
    ],
    ".dependency-cruiser.js": [
      "pnpm arch:check"
    ]
  }
}
```

## 6. Setup Steps After Copying

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Initialize Husky:**
   ```bash
   pnpm prepare
   ```
   This will set up the `.husky` hooks.

3. **Verify setup:**
   ```bash
   pnpm lint
   pnpm type-check
   pnpm validate:structure
   pnpm arch:check
   ```

4. **Test pre-commit hook:**
   Make a small change and try to commit - the pre-commit hook should run automatically.

## 7. Optional but Recommended

### Additional Configuration Files
- `babel.config.js` - Babel configuration (if using Babel)
- `rollup.config.js` - Rollup configuration (if building a library)
- `.gitignore` - Ensure it includes:
  - `node_modules/`
  - `dist/`
  - `build/`
  - `.husky/_/`
  - `coverage/`
  - `.dependency-cruiser-baseline.json` (optional, can be committed)

## Summary Checklist

- [ ] Copy `.cursor/commands/` folder (all files)
- [ ] Copy `.cursor/rules/` folder (all files)
- [ ] Copy `.husky/` folder (all files including `_/` subdirectory)
- [ ] Copy `.eslintrc.json`
- [ ] Copy `.eslintignore`
- [ ] Copy `.dependency-cruiser.js`
- [ ] Copy `tsconfig.json`
- [ ] Copy `vite.config.ts` (or adapt for your build tool)
- [ ] Copy `projectStructure.config.js`
- [ ] Copy `scripts/project-structure-validator.js`
- [ ] Update `package.json` with required scripts, devDependencies, and lint-staged config
- [ ] Run `pnpm install`
- [ ] Run `pnpm prepare` to initialize Husky
- [ ] Test pre-commit hook with a test commit
