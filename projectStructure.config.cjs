/**
 * Project Structure Configuration
 *
 * Defines the whitelist of allowed files and folders in the project.
 * This configuration is used by the project structure validator to enforce
 * architectural rules and prevent unauthorized file/folder creation.
 *
 * @relatedFiles
 * When updating this file, also check:
 * - scripts/project-structure-validator.js - Validator that reads this config
 * - package.json - Scripts that run validation (validate:structure)
 * - documentation/PROJECT-STRUCTURE-VALIDATION.md - User documentation
 * - architecture.md - Architecture documentation
 * - .cursor/rules/file-placement/RULE.md - File placement rules
 * - .cursor/rules/architecture/RULE.md - Architecture rules
 */
/** @type {import('./scripts/project-structure-validator').ProjectStructureConfig} */
module.exports = {
  structure: [
    // Root level: src folder
    {
      name: "src",
      children: [
        // Pages
        // NOTE: Prefer named files (PageName.tsx) over index.tsx for clarity and better IDE navigation.
        // Barrel files (index.ts) are NOT allowed in pages - use direct imports only.
        // Components subdirectories should be minimal - only use if page has multiple page-specific components.
        {
          name: "pages",
          children: [
            { name: "*.tsx" }, // PREFERRED: Named page components directly in pages (e.g., AuthCallbackPage.tsx)
            {
              name: "*",
              children: [
                { name: "index.tsx" }, // Allowed but not preferred - use named files instead
                { name: "index.ts" }, // Barrel files discouraged - kept for backward compatibility only
                { name: "*.tsx" }, // PREFERRED: Named page components (e.g., ChatPage.tsx, FilesPage.tsx)
                {
                  name: "*",
                  children: [
                    { name: "index.tsx" }, // Allowed but not preferred - use named files instead
                    { name: "*.tsx" }, // Named page components (e.g., MarkdownEditorPage.tsx)
                    {
                      name: "components",
                      children: [
                        {
                          name: "*",
                          children: [
                            { name: "*.tsx" },
                            { name: "*.ts" },
                            { name: "index.ts" },
                            {
                              name: "*",
                              children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                            },
                          ],
                        },
                        { name: "*.tsx" },
                        { name: "*.ts" },
                        { name: "index.ts" },
                      ],
                    },
                  ],
                },
                {
                  name: "components",
                  children: [
                    {
                      name: "*",
                      children: [
                        { name: "*.tsx" },
                        { name: "*.ts" },
                        { name: "index.ts" },
                        {
                          name: "*",
                          children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                        },
                      ],
                    },
                    { name: "*.tsx" },
                    { name: "*.ts" },
                    { name: "index.ts" },
                  ],
                },
              ],
            },
            { name: "index.ts" }, // Root barrel file - discouraged, kept for backward compatibility
          ],
        },
        // Layouts
        {
          name: "layouts",
          children: [
            { name: "*.tsx" }, // Named layout files directly in layouts (e.g., MainLayout.tsx)
            {
              name: "*",
              children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
            },
            { name: "index.ts" },
          ],
        },
        // Features
        {
          name: "features",
          children: [
            {
              name: "*",
              children: [
                // Support nested features (e.g., admin/billing) - must come first
                {
                  name: "*",
                  children: [
                    {
                      name: "components",
                      children: [
                        {
                          name: "*",
                          children: [
                            {
                              name: "*",
                              children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                            },
                            { name: "*.tsx" },
                            { name: "*.ts" },
                            { name: "index.ts" },
                          ],
                        },
                        { name: "*.tsx" },
                        { name: "*.ts" },
                        { name: "index.ts" },
                      ],
                    },
                    {
                      name: "hooks",
                      children: [
                        { name: "*.ts" }, // Includes *.test.ts (unit tests colocated)
                      ],
                    },
                    {
                      name: "services",
                      children: [
                        { name: "*.ts" }, // Includes *.test.ts (unit tests colocated)
                      ],
                    },
                    {
                      name: "types",
                      children: [{ name: "*.ts" }, { name: "index.ts" }],
                    },
                    {
                      name: "context",
                      children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                    },
                    {
                      name: "store",
                      children: [{ name: "*.ts" }, { name: "index.ts" }],
                    },
                  ],
                },
                // Support flat features (e.g., chat, assistants) - comes after nested
                {
                  name: "components",
                  children: [
                    {
                      name: "*",
                      children: [
                        {
                          name: "*",
                          children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                        },
                        { name: "*.tsx" },
                        { name: "*.ts" },
                        { name: "index.ts" },
                      ],
                    },
                    { name: "*.tsx" },
                    { name: "*.ts" },
                    { name: "index.ts" },
                  ],
                },
                {
                  name: "hooks",
                  children: [
                    { name: "*.ts" }, // Hook files
                    { name: "*.test.ts" }, // Test files for hooks
                    { name: "*.test.tsx" }, // Test files with JSX for hooks
                  ],
                },
                {
                  name: "services",
                  children: [{ name: "*.ts" }],
                },
                {
                  name: "types",
                  children: [{ name: "*.ts" }, { name: "index.ts" }],
                },
                {
                  name: "context",
                  children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                },
                {
                  name: "store",
                  children: [{ name: "*.ts" }, { name: "index.ts" }],
                },
              ],
            },
          ],
        },
        // Components
        {
          name: "components",
          children: [
            {
              name: "common",
              children: [
                {
                  name: "*",
                  children: [{ name: "*.tsx" }, { name: "*.ts" }, { name: "index.ts" }],
                },
                { name: "*.tsx" },
                { name: "*.ts" },
                { name: "index.ts" },
              ],
            },
          ],
        },
        // Routes
        {
          name: "routes",
          children: [
            { name: "index.tsx" },
            {
              name: "guards",
              children: [{ name: "*.tsx" }, { name: "index.ts" }],
            },
          ],
        },
        // Config
        {
          name: "config",
          children: [{ name: "*.ts" }],
        },
        // Shared
        {
          name: "shared",
          children: [
            {
              name: "hooks",
              children: [
                { name: "*.ts" }, // Includes *.test.ts (unit tests colocated)
              ],
            },
            {
              name: "services",
              children: [
                { name: "*.ts" }, // Includes *.test.ts (unit tests colocated)
              ],
            },
            {
              name: "utils",
              children: [
                { name: "*.ts" }, // Includes *.test.ts (unit tests colocated)
              ],
            },
            {
              name: "types",
              children: [{ name: "*.ts" }, { name: "index.ts" }],
            },
            {
              name: "config",
              children: [{ name: "*.ts" }, { name: "*.js" }],
            },
            {
              name: "context",
              children: [{ name: "*.tsx" }, { name: "*.ts" }],
            },
            {
              name: "theme",
              children: [{ name: "*.ts" }, { name: "index.ts" }],
            },
            { name: "constants.ts" },
          ],
        },
        // AI Capabilities
        {
          name: "ai-capabilities",
          children: [
            {
              name: "client",
              children: [{ name: "*.ts" }],
            },
            {
              name: "hooks",
              children: [{ name: "*.ts" }],
            },
            {
              name: "services",
              children: [{ name: "*.ts" }],
            },
            {
              name: "tools",
              children: [
                {
                  name: "*",
                  children: [{ name: "*.ts" }, { name: "index.ts" }],
                },
                { name: "index.ts" },
              ],
            },
            {
              name: "types",
              children: [{ name: "*.ts" }],
            },
            {
              name: "utils",
              children: [{ name: "*.ts" }],
            },
            { name: "index.ts" },
          ],
        },
        // Lib
        {
          name: "lib",
          children: [
            {
              name: "components",
              children: [{ name: "index.ts" }],
            },
            {
              name: "hooks",
              children: [{ name: "*.ts" }, { name: "index.ts" }],
            },
            {
              name: "types",
              children: [{ name: "index.ts" }],
            },
            {
              name: "utils",
              children: [{ name: "*.ts" }, { name: "index.ts" }],
            },
            { name: "index.ts" },
          ],
        },
        // Types
        {
          name: "types",
          children: [{ name: "*.d.ts" }],
        },
        // Utils
        {
          name: "utils",
          children: [{ name: "*.ts" }],
        },
        // Reference (documentation)
        {
          name: "_reference",
          children: [
            { name: "*.txt" },
            { name: "*.ts" },
            { name: "README.md" },
            { name: "*" }, // Allow files without extension (reference files)
          ],
        },
        // Assets
        {
          name: "assets",
          children: [
            { name: "*.svg" },
            { name: "*.png" },
            { name: "*.jpg" },
            { name: "*.jpeg" },
            { name: "*.gif" },
            { name: "*.ico" },
          ],
        },
        // Root src files
        { name: "App.tsx" },
        { name: "App.css" },
        { name: "main.tsx" },
        { name: "index.tsx" },
        { name: "index.css" },
        { name: "logo.svg" },
        { name: "reportWebVitals.ts" },
        { name: "setupProxy.js" },
        { name: "setupTests.ts" },
        { name: "vite-env.d.ts" },
      ],
    },
    // Public folder
    {
      name: "public",
      children: [
        { name: "*.html" },
        { name: "*.png" },
        { name: "*.svg" },
        { name: "*.txt" },
        { name: "*.json" },
        { name: "*.ico" },
        {
          name: "documentation",
          children: [{ name: "*.md" }],
        },
      ],
    },
    // Tests
    // Unit tests are colocated with source (src/**/*.test.ts)
    // Integration and E2E tests are in tests/ folder
    {
      name: "tests",
      children: [
        {
          name: "integration",
          children: [{ name: "*.test.ts" }, { name: "*.test.tsx" }],
        },
        {
          name: "e2e",
          children: [{ name: "*.test.ts" }, { name: "*.test.tsx" }],
        },
        { name: "test-utils.ts" },
        { name: "test-utils.tsx" },
        { name: "setup.ts" },
      ],
    },
    // Documentation
    {
      name: "documentation",
      children: [
        // Specific subdirectories first (before wildcard)
        {
          name: "jobs",
          children: [
            { name: "*.md" },
            {
              name: "*",
              children: [{ name: "*.md" }],
            },
          ],
        },
        // Root-level files
        { name: "*.md" },
        { name: "*.dbml" },
        { name: "*.svg" },
        { name: "*.sql" }, // SQL documentation/queries
        { name: "*.html" }, // HTML documentation/examples
        { name: "*.xml" }, // XML reference files
        // Wildcard subdirectories (after specific ones)
        {
          name: "*",
          children: [
            { name: "*.md" },
            { name: "*.dbml" },
            { name: "*.xml" },
            { name: "*" }, // Allow files without extension in subdirectories
          ],
        },
      ],
    },
    // Supabase
    {
      name: "supabase",
      children: [
        { name: "*.toml" },
        { name: "*.md" },
        { name: "*.ps1" },
        { name: ".gitignore" },
        {
          name: "backups",
          children: [
            {
              name: "*",
              children: [{ name: "*.sql" }, { name: "*.md" }],
            },
          ],
        },
        {
          name: "functions",
          children: [
            { name: "*.ts" },
            { name: "*.md" },
            {
              name: "*",
              children: [{ name: "*.ts" }, { name: "*.md" }, { name: "index.ts" }],
            },
            {
              name: "_backups",
              children: [
                {
                  name: "*",
                  children: [
                    { name: "*.ts" },
                    { name: "*.md" },
                    { name: "*" }, // Allow any files in backup subdirectories
                  ],
                },
              ],
            },
            {
              name: "_shared",
              children: [
                { name: "*.ts" },
                {
                  name: "*",
                  children: [
                    { name: "*.ts" },
                    { name: "*" }, // Allow any files in _shared subdirectories
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "migrations",
          children: [{ name: "*.sql" }],
        },
      ],
    },
    // Cloud functions - allow all files for flexibility (helper scripts, configs, etc.)
    {
      name: "cloud-functions",
      children: [
        { name: "*.zip" }, // Allow zip files in root
        {
          name: "*",
          children: [
            { name: "*" }, // Allow all files (including dotfiles via minimatch)
            { name: ".*" }, // Explicitly allow dotfiles
            {
              name: "*",
              children: [
                { name: "*" }, // Allow all files in subdirectories
                { name: ".*" }, // Explicitly allow dotfiles in subdirectories
              ],
            },
          ],
        },
      ],
    },
    // Scripts
    {
      name: "scripts",
      children: [
        { name: "*.js" },
        { name: "*.json" },
        { name: "*.ps1" }, // PowerShell scripts
      ],
    },
    // Migrations
    {
      name: "migrations",
      children: [
        {
          name: "*",
          children: [{ name: "*.ts" }],
        },
        { name: "README.md" },
      ],
    },
    // Cursor rules (IDE-specific, allow all subdirectories)
    {
      name: ".cursor",
      children: [
        {
          name: "rules",
          children: [
            {
              name: "*",
              children: [{ name: "RULE.md" }],
            },
            { name: "README.md" },
            { name: "INDEX.md" },
          ],
        },
        {
          name: "commands",
          children: [
            { name: "*.md" },
            {
              name: "archive",
              children: [{ name: "*.md" }],
            },
          ],
        },
        {
          name: "plans",
          children: [{ name: "*.md" }],
        },
        {
          name: "screenshots",
          children: [{ name: "*.png" }, { name: "*.jpg" }, { name: "*.jpeg" }],
        },
        { name: "*.json" },
        { name: "*.log" },
      ],
    },
    // GitHub workflows (if exists)
    {
      name: ".github",
      children: [
        { name: ".rebuild-trigger" }, // GitHub rebuild trigger file
        {
          name: "workflows",
          children: [{ name: "*.yml" }],
        },
      ],
    },
    // Husky git hooks
    {
      name: ".husky",
      children: [
        { name: "pre-commit" },
        { name: "pre-push" },
        { name: "commit-msg" },
        {
          name: "_",
          children: [
            { name: "*.sh" },
            { name: ".gitignore" },
            { name: "*" }, // Allow all husky internal files
          ],
        },
      ],
    },
    // Root config files - specific files only (no wildcards to prevent temporary/corrupted files)
    // JSON config files
    { name: ".dependency-cruiser-baseline.json" },
    { name: ".eslintrc.json" },
    { name: "cors.json" },
    { name: "database.rules.json" },
    { name: "firebase.json" },
    { name: "package.json" },
    { name: "projectStructure.cache.json" },
    { name: "saml-attribute-mapping.json" },
    { name: "tsconfig.json" },
    { name: "tsconfig.app.json" },
    { name: "tsconfig.lib.json" },
    { name: "tsconfig.node.json" },
    // JavaScript config files (specific only, no wildcard)
    { name: ".eslintrc.js" },
    { name: "eslint.config.js" },
    { name: "eslint.ignores.js" },
    { name: ".dependency-cruiser.cjs" },
    { name: "projectStructure.config.cjs" },
    { name: "babel.config.js" },
    { name: "rollup.config.js" },
    { name: ".prettierrc.js" },
    { name: ".prettierrc.json" },
    { name: ".npmrc" },
    { name: ".npmignore" },
    // TypeScript config files (specific only, no wildcard)
    { name: "vite.config.ts" },
    { name: "vitest.config.ts" },
    { name: "vite-plugin-env-writer.ts" },
    // YAML files (specific only, no wildcard - pure whitelist)
    { name: "pnpm-lock.yaml" },
    { name: "pnpm-workspace.yaml" },
    { name: "apphosting.yaml" },
    // TOML files (specific only, no wildcard - pure whitelist)
    // Note: Add specific TOML files here if needed (e.g., netlify.toml)
    // Markdown documentation files - ONLY README, architecture, and CHANGELOG allowed in root
    { name: "README.md" },
    { name: "architecture.md" },
    { name: "ARCHITECTURE.md" }, // Allow uppercase variant
    { name: "CHANGELOG.md" },
    // XML files removed - should be in documentation/ if needed for reference
    // SQL files removed - should be in migrations/ or documentation/, not root
    // Other config files
    { name: ".gitignore" },
    { name: ".gitattributes" },
    { name: ".eslintignore" },
    { name: ".editorconfig" },
    { name: ".firebaserc" },
    { name: "index.html" },
    // Environment files (specific only, no wildcard - pure whitelist)
    { name: ".env" },
    { name: ".env.local" },
    { name: ".env.example" },
    // Environment backup files (allowed until backups/ directory decision is made)
    { name: ".env.backup" },
    { name: ".env.backup-*" },
  ],
};
