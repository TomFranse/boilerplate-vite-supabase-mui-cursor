# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2026-01-17]

### Changed

- **Rule Documentation**: Improved rule quality standards and documentation
  - Enhanced `improve-rule.md` with better brevity standards and removed rigid if-then requirements
  - Fixed path references in `finish2.md` to use consistent `.cursor/rules/` format
  - Improved workflow rule brevity by removing excessive emphasis and code examples
  - Improved architecture rule brevity by removing code snippets and verbose explanations
  - Improved project-specific rule brevity by abstracting code examples
  - Connected workflow rule and finish2 command with bidirectional references

## [2026-01-12]

### Changed

- **Code Optimization**: Reduced complexity in setup components and services
  - Extracted `useWizardStep` hook for wizard step management (reduces AirtableDialog complexity from 15 to ~8)
  - Refactored `buildConfig` function in configService (reduced complexity from 25 to ~8-10)
  - Extracted helper functions: `readEnvVar`, `isPlaceholder`, `buildSupabaseConfig`, `buildAirtableConfig`, `buildThemeConfig`
  - Simplified conditionals using switch-based validation patterns
  - Improved code maintainability and testability

## [2026-01-12]

### Changed

- **Scrollbar Styling**: Simplified scrollbar appearance with transparent track and subtle thumb
  - Removed prominent background color from scrollbars
  - Scrollbar thumb uses theme's text.primary color with 30% opacity (50% on hover)
  - Transparent track for minimal visual footprint
  - Works across all browsers (Firefox and Webkit-based browsers)
  - Styling uses theme constants (`COLORS.text.primary`) for consistency

## [2026-01-12]

### Added

- **Styling Scope Standards Rule**: Added new cursor rule to prevent incorrect styling scope decisions
  - Requires assistants to ask users about styling scope before implementing changes
  - Defines three-level hierarchy: Instance → Component → Global Theme
  - Prevents applying styling changes at wrong scope (e.g., instance when global intended)
  - Includes decision tree for determining correct styling level
  - Default assumption: Global Theme (most common intent)
  - Ensures consistency with existing theme architecture (`defaultTheme.ts` as SSOT)

### Changed

- **Code Style Rule Optimization**: Streamlined `.cursor/rules/code-style/RULE.md` for better context efficiency
  - Removed redundant sections (43% reduction: 525 → 297 lines)
  - Removed extensive examples that overload context window
  - Added SSOT references instead of duplicating content
  - Formatting rules now reference Prettier config instead of duplicating
  - Architecture layer rules now reference `architecture/RULE.md` instead of duplicating
  - Complexity examples moved to referenced command file
  - TypeScript rules consolidated to reference Quick Reference

## [2026-01-12]

### Changed

- **Centralized Button Styling**: Refactored button styling to be fully centralized in theme
  - Removed all `color` props from button usages across the application
  - Button variants now automatically determine colors:
    - `variant="contained"` → uses primary color (main actions)
    - `variant="outlined"` → uses white color (secondary actions)
    - `variant="text"` → uses primary color (text buttons)
  - All button styling is now managed in `defaultTheme.ts` - components only specify variant
  - Ensures consistent button styling across the entire application

- **Outlined Button Hover Effect**: Enhanced outlined button with animated gradient slide effect
  - Outlined buttons now have a smooth gradient slide animation on hover (matching contained buttons)
  - Gradient transitions from transparent to white with sliding animation
  - Text color transitions from white to dark during hover for readability
  - Uses pseudo-element with proper z-index layering to ensure text remains visible
  - Background size optimized so gradient is only visible during transition, not in static states

### Fixed

- **Button Hover Color Issues**: Fixed inconsistent hover colors on buttons
  - Previously buttons using undefined colors (`success`, `warning`, `error`, `inherit`) caused unpredictable hover colors
  - All buttons now use centralized theme colors with consistent hover states
  - Removed dependency on undefined MUI color props

### Added

- **ESLint Hardcoded Styling Detection**: Added ESLint rules to detect hardcoded styling values in `sx` props
  - Detects hardcoded `fontSize`, `fontWeight`, `fontFamily`, `color`, `bgcolor`, `backgroundColor`, `borderColor` values
  - Detects hex colors (`#...`) and RGB/RGBA colors in `sx` props
  - Detects numeric literals for `fontSize`, `fontWeight`, `height`, `width` properties
  - Catches styling at both root and nested property levels
  - Excludes theme files from rules (they are where styling SHOULD be defined)
  - Encourages developers to use theme constants instead of hardcoded values
  - All violations reported as warnings (non-blocking)

### Fixed

- **Hardcoded Styling Values**: Replaced all hardcoded styling values with theme references
  - Replaced hardcoded `fontSize` values (`0.875rem`, `0.65rem`, `16px`) with `theme.typography.body2.fontSize` and `theme.typography.caption.fontSize`
  - Replaced hardcoded `fontWeight` values (`500`, `600`) with `theme.typography.fontWeightMedium` and `theme.typography.fontWeightBold`
  - Replaced hardcoded pixel dimensions (`20px`, `32px`, `40px`) with `theme.spacing()` calls
  - Updated all components to use direct theme access following MUI best practices
  - Removed custom helper functions in favor of direct theme references
  - Fixed TypeScript error with `navigator.clipboard` by adding proper type checking

### Changed

- **Theme Refactoring**: Refactored theme to follow MUI best practices
  - Removed custom helper functions (`getCodeFontSize`, `getCodeFontFamily`, `getSmallFontSize`, `getFontWeightSemiBold`)
  - Updated typography to use MUI's built-in variants (`body2` for code text, `caption` for small text)
  - Ensured Montserrat font family is used consistently throughout the app (including code elements)
  - Components now use direct theme access via `theme.typography.*` and `theme.spacing()` instead of helper functions
  - Follows MUI documentation patterns for theme customization
- **View Configuration Feature**: Added read-only configuration view for all setup sections
  - "View Configuration" button appears when a section is completed
  - Displays configuration details from `app.config.json` in a dialog
  - Shows non-sensitive data (Base ID, Table ID, URLs) with copy functionality
  - Masks sensitive data (API keys, tokens) with "●●●●●●●●" and status indicators
  - Includes "Reset Configuration" button to clear configuration and reset status
  - Auto-syncs configuration when dialog opens to ensure latest data
  - Implemented for Supabase, Airtable, Theme, and Hosting sections
  - Created reusable components: `ConfigurationViewDialog`, `ConfigurationItem`, `SensitiveDataDisplay`, `ResetConfirmDialog`
  - Added hooks: `useConfigurationData`, `useConfigurationReset`
  - Added API endpoints: `/api/read-config`, `/api/remove-env-vars`
- **Airtable Setup Improvements**: Enhanced Airtable configuration flow
  - Combined PAT creation instructions with token input in single step
  - Renamed "Enter credentials" to "Choose Base and Table"
  - Streamlined text and removed redundant UI elements
  - Single sequential list of steps for clarity
  - Moved "Skip Airtable Setup" button to dialog actions area
  - Fixed configuration sync to properly write env vars before marking as completed

### Fixed

- **CI Build Failure**: Fixed pnpm version mismatch causing `--frozen-lockfile` to fail
  - Added `packageManager` field to `package.json` pinning pnpm to v9.15.4
  - Updated CI workflow to read pnpm version from `package.json` instead of hardcoding
  - Root cause: lockfile v9.0 format requires pnpm v9+, but CI was using v8
- **Airtable Configuration Sync**: Fixed configuration not syncing to `app.config.json`
  - Added `useEnvWriter` hook to AirtableSection to write env vars before completion
  - Added auto-sync functionality when viewing configuration dialogs
  - Configuration now properly reflects actual environment variable state
- **Airtable Configuration View**: Removed duplicate information display
  - Removed redundant "Base ID Key" and "Table ID Key" status indicators
  - Configuration view now shows only Base ID, Table ID, and Personal Access Token
- **Code Block Colors**: Fixed white-on-white text issue in code blocks
  - Centralized code block styling in MUI theme via `MuiCssBaseline` and `MuiTypography`
  - Code blocks now use `background.default` to match main page wrapper
  - Removed manual color declarations from components (DRY principle)
  - All code block colors now configurable from single theme file

### Changed

- **Theme System**: Enhanced code block styling defaults
  - Added global defaults for `<code>` and `<pre>` elements via `MuiCssBaseline`
  - Added defaults for `component="code"` via `MuiTypography` styleOverrides
  - Code blocks automatically inherit theme colors without component-level overrides
  - Components now only specify layout/spacing, not colors

### Added

- **App Configuration File (`app.config.json`)**: Configuration state syncing
  - File stores setup section statuses, enabled features, and API references
  - Syncs when finishing setup wizard (before cleanup runs)
  - Readable by Cursor agent and team members to understand app configuration
  - Security: API keys remain in `.env`, config file only contains references
  - Added `/api/write-config` endpoint to vite-plugin-dev-api
  - Created `configService.ts` for managing configuration sync
  - Committed to version control (no secrets, useful for team context)
- **App Code Modification Feature**: Formalized dev-only code modification capability
  - Renamed `vite-plugin-env-writer.ts` → `vite-plugin-dev-api.ts` for clarity
  - Extracted `envWriterService.ts` from `useEnvWriter` hook for better separation
  - Added comprehensive documentation (`documentation/APP_CODE_MODIFICATION.md`)
  - Documented in `ARCHITECTURE.md` as a recognized feature
  - Feature enables UI to modify app source code and configuration files during development
  - Used by setup wizard for environment variable writing and code cleanup
- **Enhanced Airtable Setup**: Multi-step setup wizard with table structure validation
  - Step 0: PAT creation instructions with direct link to Airtable token creation page
  - Step 1: Credential entry (API Key, Base ID, Table ID) with helpful guidance
  - Step 2: Connection validation and table structure retrieval using Airtable Meta API
  - Step 3: Review table structure and complete setup
  - `TableStructureDisplay` component showing table name, fields, types, and options
  - `getAirtableTableStructure()` service function using Airtable Meta API
  - Enhanced `useAirtableSetup` hook with structure fetching capabilities
  - Improved cleanup script that removes `airtable` npm package when Airtable is skipped
- **Airtable Setup Utilities**: Added reset functions for testing/development
  - `resetAirtableSetup()` - Reset Airtable setup status
  - `resetAllSetupSections()` - Reset all setup sections
- **Boilerplate Extraction System**: Added enterprise-grade scalability tools from main app
  - Project structure validation system with `projectStructure.config.cjs`
  - Dependency cruiser for architecture validation (`arch:check` command)
  - Husky pre-commit hooks with lint-staged
  - ESLint architecture boundary rules (`lint:arch` command)
  - Comprehensive complexity rules (cyclomatic, cognitive, max-statements, etc.)
- **Theme Customization**: Default theme now pre-populated in theme customization dialog
  - Theme JSON input field automatically shows default theme options as starting point
  - Default theme content imported directly from `defaultTheme.ts` (single source of truth)
  - Users can see what's available and modify from there

### Changed

- **ESLint Configuration**: Increased `max-statements` threshold from 10 to 15
  - Accommodates standard async patterns with proper error handling
  - Aligns with cognitive complexity threshold (15)
  - Reduces false positives for well-structured async functions
- **Project Structure**: Reorganized files to match enterprise architecture rules
  - Moved `src/common/` → `src/components/common/`
  - Moved `src/store/contexts/` → `src/shared/context/`
  - Moved `src/features/auth/utils/` → `src/shared/utils/`
  - Renamed `test/` → `tests/` folder
  - Colocated test files (removed `__tests__` folders)
  - Updated all import paths to use correct aliases
- **HostingSection**: Refactored to use data-driven approach
  - Extracted hardcoded provider data to `HOSTING_PROVIDERS` constant array
  - Replaced repetitive JSX with `map()` function
  - Reduced `HostingDialog` from 161 lines → 72 lines (55% reduction)
  - Improved maintainability and scalability

- **SetupDialog**: Made dialog scale flexibly to fill available screen space
  - Dialog now uses responsive width/height (95% on mobile down to 80% on large screens)
  - Maximum dimensions: 1200px width, 90vh height
  - Dialog adapts to zoom levels (Ctrl +/-) and screen sizes
  - Only TextField input area scrolls, all other content stays fixed
- **SetupDialog**: Removed unnecessary style declarations
  - Removed redundant padding/margin overrides that MUI handles by default
  - Removed unnecessary Box wrapper with padding
  - Cleaner code relying on MUI's built-in spacing

### Fixed

- **ThemeSection TextField**: Fixed label styling being affected by input styles
  - Changed selector from `.MuiInputBase-root` to `.MuiInputBase-input`
  - Label now uses MUI's default styling correctly
  - Only input text area uses monospace font, not the label
- **ThemeSection**: Refactored ThemeDialog to comply with complexity rules
  - Extracted `ThemeDialogContent` component to separate UI rendering from state management
  - Reduced `ThemeDialog` function from 134 lines to 75 lines (under 100-line limit)
  - Improved code maintainability by separating concerns

### Removed

- **Migration Function**: Removed `migrateOldSetupState` from `setupUtils.ts`
  - Removed backward compatibility migration logic
  - Removed unused `detectCompletedSections` helper function
  - Removed unused imports (`isSupabaseConfigured`, `isAirtableConfigured`, `getCustomTheme`)
  - Simplified `useSetupFinish` hook (removed migration useEffect)
  - Reduced `setupUtils.ts` from 163 lines → 87 lines (47% reduction)
- **Login and Signup Pages**: Removed dedicated authentication pages
  - Removed `LoginPage` and `SignUpPage` components
  - Removed `AuthLayout` (no longer needed)
  - Removed `SignUpForm` component
  - Authentication now handled entirely through ProfileMenu in topbar
  - Updated HomePage to show message directing users to topbar for sign-in

### Changed

- **SetupPage Refactoring**: Moved logic from page to feature following architecture rules
  - Extracted `FinishSetupDialog` component to `features/setup/components/`
  - Created `useSetupFinish` hook in `features/setup/hooks/` for state management
  - Created `setupService.ts` in `features/setup/services/` for API calls
  - SetupPage reduced from 117 lines to 71 lines (under 100-line limit)
  - Page now follows thin component pattern: composes feature components/hooks
- **ESLint Configuration**: Increased `max-lines-per-function` limit from 50 to 100 lines
  - More reasonable limit for React components while still catching overly complex functions
- **TypeScript Configuration**: Added path aliases to root `tsconfig.json`
  - Ensures IDE properly resolves `@features/*` imports
  - Added `moduleResolution: "node"` for proper module resolution

### Fixed

- **TypeScript Module Resolution**: Fixed IDE errors for `@features/setup/*` imports
  - Path aliases now configured in both `tsconfig.app.json` (build) and `tsconfig.json` (IDE)
  - All module resolution errors resolved
- **React Import**: Removed unnecessary React import from ProfileMenu component
  - Removed `import React from "react"` (not needed with `jsx: "react-jsx"` transform)
  - Changed `React.FC` to regular function signature
  - Fixes TypeScript `esModuleInterop` error

### Technical

- **Architecture Compliance**: SetupPage now follows proper dependency hierarchy
  - Page → Feature Components/Hooks → Services pattern
  - Logic moved from page level to feature level
  - Reusable `FinishSetupDialog` component created
- **Code Organization**: Improved adherence to architecture rules
  - All components follow the dependency hierarchy: Components → Hooks → Services
  - Setup feature properly structured with components, hooks, services, and sections
  - Shared hooks created in `src/shared/hooks/` for cross-feature use

## [0.6.0] - 2026-01-03

### Removed

- **Todo feature**: Removed all todo-related functionality to simplify boilerplate
  - Removed `TodosPage` and all todo components
  - Removed todo feature directory (`src/features/todos/`)
  - Removed data provider pattern (types, factory, and all provider implementations)
  - Removed `ProtectedRoute` component (no longer needed)
  - Removed database setup section from setup wizard
- **Database setup**: Removed "Create Database Tables" step from setup wizard
  - Removed `DatabaseSection.tsx` component
  - Removed database section from setup state tracking

### Changed

- **Setup page**: Simplified setup wizard UI
  - Removed title "Welcome to Vite MUI Supabase Starter" (already in topbar)
  - Removed progress bar and related logic
  - Simplified description text layout
- **Navigation**: Removed "Todos" button from topbar
- **Home page**: Removed todo-related buttons and references
- **Workflow rules**: Updated PowerShell examples to prevent VS Code network errors
  - Added `Out-String` before `Select-Object` in all examples
  - Added warning about direct piping to `Select-Object`

### Fixed

- Removed unused variables (`user` in Topbar, `sectionsState` in SetupPage)
- Fixed all linting errors (only warnings remain)

### Technical

- **Boilerplate Focus**: Now focused on connecting APIs (Supabase for auth, Airtable for data) and theme setup
- **Cleanup**: Removed empty `dataProviders` directory
- **Documentation**: Updated README to remove todo references
- **Tests**: Updated test files to use `/dashboard` instead of `/todos` paths

## [0.5.8] - 2026-01-03

### Fixed

- Architectural violations: Moved ProfileMenu hooks and utilities to correct locations
  - Moved `useProfileMenuState` and `useProfileMenuHandlers` hooks from `components/ProfileMenu/` to `features/auth/hooks/`
  - Moved `profileHelpers` and `menuConfig` utilities from `components/ProfileMenu/` to `features/auth/utils/`
  - Updated all import statements to use correct paths with `@features/auth/` aliases

### Technical

- **Architecture Compliance**: Fixed violations of "The Hook Rule" and "The Service/Util Rule" from `.cursor/rules/architecture/RULE.md`
- All hooks now correctly located in `features/[feature]/hooks/` directories
- All utilities now correctly located in `features/[feature]/utils/` directories
- Components folder now only contains UI components (no business logic)
- Type-check passes, build succeeds, no linting errors

## [0.5.7] - 2026-01-03

### Changed

- Major complexity reduction refactoring across priority hotspots
- Reduced code complexity and improved maintainability through modularization
- Extracted shared components and hooks to reduce duplication

### Technical

- **ProfileMenu.tsx**: Reduced from 357 lines → 64 lines (82% reduction)
  - Extracted 7 components, 2 hooks, and utility functions
  - Complexity reduced from 42 → ~8
- **dateFormatters.ts**: Refactored `formatRelativeTime()` using lookup pattern
  - Reduced from 22 statements → 10 statements
  - Complexity reduced from 14 → ~5, Cognitive: 18 → ~8
- **SupabaseSection.tsx & AirtableSection.tsx**: Reduced from 217/211 lines → 87/81 lines
  - Created shared components: `ConnectionTestResult`, `EnvVariablesDisplay`
  - Created shared hooks: `useConnectionTest`, `useEnvWriter`
  - Extracted form fields and description components
- **useAuth.ts**: Reduced from 142 lines → 68 lines (52% reduction)
  - Extracted utilities: `oauthUtils.ts`, `useAuthSession.ts`, `useAuthStateSubscription.ts`
  - Extracted handlers: `useAuthHandlers.ts`, `authHandlerUtils.ts`
- **useUserProfile.ts**: Extracted constants and helper functions
  - Reduced statement count from 19 → 10 per function
- **AuthCallbackPage.tsx**: Extracted utilities for better organization
  - Created `authCallbackUtils.ts` and `authCallbackParams.ts`
- Added ESLint complexity rules: `complexity`, `max-depth`, `max-lines-per-function`, `max-statements`, `max-params`, `sonarjs/cognitive-complexity`
- All tests passing (53 tests)
- All TypeScript errors resolved

## [0.5.6] - 2026-01-03

### Changed

- Updated workflow rules with comprehensive PowerShell exit code handling guidance
- Added patterns and best practices to prevent Cursor crashes when running terminal commands
- Documented use of `$LASTEXITCODE` instead of `$?` for proper exit code propagation

### Technical

- Enhanced `.cursor/rules/workflow/RULE.md` with PowerShell command patterns
- Added examples for simple commands, directory changes, output filtering, and special character handling
- Documented why exit code checks prevent Cursor crashes (error output vs success state mismatch)

## [0.5.5] - 2026-01-02

### Fixed

- Fixed anonymous users being displayed as signed-in users in the UI
- Anonymous users now correctly show sign-in options instead of user profile and sign-out button
- Anonymous users are properly filtered out in all authentication code paths

### Changed

- Updated anonymous user detection to use Supabase's official `is_anonymous` property instead of custom metadata checks
- Refactored user conversion logic into shared utility functions for consistency

### Technical

- Created `src/features/auth/utils/userUtils.ts` with shared utility functions:
  - `isAnonymousUser()` - Checks Supabase's official `is_anonymous` property
  - `supabaseUserToUser()` - Converts Supabase user to app User interface, filtering anonymous users
- Updated `useAuth.ts` hook to use shared utility functions
- Updated `authService.ts` functions (`login()`, `signUp()`, `getCurrentUser()`) to filter anonymous users
- All code paths now consistently use Supabase's recommended approach for anonymous user detection
- Type-safe implementation using official Supabase `User` type from `@supabase/supabase-js`

## [0.5.4] - 2026-01-03

### Added

- Redirect after sign-in feature - users are redirected to their last visited page after authentication
- `useAuthRedirect` hook for handling post-authentication redirects
- Redirect utilities (`redirectUtils.ts`) for managing redirect paths in sessionStorage
- Path validation to prevent redirect loops (rejects `/login`, `/auth`, `/signup` paths)
- Comprehensive test coverage for redirect functionality (21 tests)

### Changed

- `ProtectedRoute` now stores intended destination before redirecting to login
- `LoginForm` and `SignUpForm` use `useAuthRedirect` hook for consistent redirect behavior
- `AuthCallbackPage` redirects to stored path after OAuth/SAML authentication
- `ProtectedRoute` loading state now uses MUI `CircularProgress` component instead of plain div

### Fixed

- Fixed test mock for `authService.test.ts` to include `isSupabaseConfigured` export
- Fixed line ending issues (CRLF to LF) in redirect-related files
- Fixed floating promise lint error in `useAuthRedirect` hook

### Technical

- Created `src/utils/redirectUtils.ts` with sessionStorage-based redirect path management
- Created `src/features/auth/hooks/useAuthRedirect.ts` hook for redirect orchestration
- Added unit tests for redirect utilities (`redirectUtils.test.ts` - 14 tests)
- Added unit tests for redirect hook (`useAuthRedirect.test.tsx` - 7 tests)
- Redirect path stored in sessionStorage persists across OAuth redirects
- Graceful error handling for private browsing mode and storage errors

## [0.5.3] - 2026-01-02

### Added

- Active menu item highlighting in Topbar navigation
- Navigation buttons now display primary color when on active route

### Changed

- Refactored theme system to be the single source of truth for all app styling
- All colors, typography, and component styling now centralized in `src/shared/theme/defaultTheme.ts`
- Removed all conflicting CSS files (`index.css`, `App.css`, `global.css`)
- Theme now handles all global styles via `MuiCssBaseline` customization
- Added `MuiLink` component styling to theme (handles link hover colors)
- Improved theme documentation with usage examples and structure explanations
- Topbar navigation buttons use conditional `color` prop for active state (leverages theme system)

### Removed

- `src/index.css` - Vite boilerplate CSS conflicting with MUI theme
- `src/App.css` - Unused Vite boilerplate CSS
- `src/assets/styles/global.css` - Styles moved to theme via `MuiCssBaseline`
- All CSS imports from `main.tsx` - styling now handled entirely by MUI theme

### Technical

- Centralized color constants in `COLORS` object for better maintainability
- Added comprehensive documentation to all theme files
- Theme files now include JSDoc comments explaining structure and usage
- `MuiCssBaseline` handles box-sizing, code fonts, and body styles
- All component styling moved to theme `components.styleOverrides`
- Components now use `sx` prop only for layout/spacing, not colors/styling

## [0.5.2] - 2026-01-02

### Added

- User profile data fetching from Supabase `users` table
- `useUserProfile` hook to fetch and manage user profile data
- Enhanced ProfileMenu with detailed user information:
  - Display name (falls back to email if not set)
  - Profile photo support via `photo_url`
  - Email verification badge
  - User role display (Free, Premium, Admin, Super Admin)
  - Remaining credits display
  - Organization name display (for Entreefederatie users)
- Loading state indicator in ProfileMenu while fetching profile data

### Changed

- ProfileMenu now displays comprehensive user information from database
- ProfileMenu uses arrays instead of Fragments for MUI Menu compatibility
- Avatar component now supports photo URLs from user profile

### Fixed

- Fixed MUI Menu Fragment warning by using arrays instead of Fragments
- Fixed import path in LoginPage for ProfileMenu component

### Technical

- Created `useUserProfile` hook in `src/features/auth/hooks/useUserProfile.ts`
- Hook automatically fetches user profile when user logs in
- Handles missing user profiles gracefully (user may not exist in users table yet)
- ProfileMenu displays user details with proper loading and error states

## [0.5.1] - 2026-01-02

### Added

- Permanent Topbar component that is always visible across all routes
- Reusable Topbar component (`src/components/Topbar.tsx`) designed for use across all apps
- Improved user-facing text in setup cards for better clarity

### Changed

- Topbar is now permanently visible (no longer conditional on Supabase configuration)
- Improved setup card descriptions to better communicate functionality:
  - "Configure Supabase" → "Connect to Supabase" with clearer description
  - "Set Up Database" → "Create Database Tables" with clearer description
- MainLayout simplified (removed duplicate AppBar, Topbar handles navigation)
- AuthLayout adjusted to account for permanent topbar

### Technical

- Created `Topbar` component with fixed positioning
- App.tsx restructured to include Topbar at root level
- Removed conditional topbar logic - now always visible
- Updated padding calculations to account for permanent topbar

## [0.5.0] - 2026-01-02

### Added

- Card-based setup dashboard replacing sequential stepper
- Reusable base Card component in `@common/Card` with MUI-standard styling
- Dynamic CSS Grid layout for cards (auto-fit based on available space)
- Per-section status tracking (not-started, in-progress, completed, skipped)
- Setup sections can be configured independently in any order
- Finish Setup feature that removes unused code based on enabled features
- Setup state migration from old localStorage flags to new structure
- MUI Dialog-based configuration for each setup section
- Progress indicator showing completion status

### Changed

- Setup page redesigned from sequential stepper to card-based dashboard
- All setup sections are now optional (removed "Optional" labels)
- Cards use playing card proportions (max-width: 400px) with increased border radius
- Cards have increased internal padding (24px) for better spacing
- Grid layout uses CSS Grid with auto-fit for dynamic column distribution
- Setup completion is now irreversible and triggers cleanup of unused code
- App routing updated to allow access anytime (setup no longer forces redirect)

### Technical

- Created `SetupSectionsState` type for per-section status tracking
- Added `getSetupSectionsState()` and `updateSetupSectionStatus()` utilities
- Added `migrateOldSetupState()` for backward compatibility
- Added `getEnabledFeatures()` for cleanup script
- Created `finish-setup.js` script for removing unused feature code
- Added `/api/finish-setup` endpoint in Vite plugin
- Base Card component with configurable elevation and hover effects
- Setup sections split into separate components (SupabaseSection, AirtableSection, etc.)
- SetupCard and SetupDialog base components for reusable patterns

## [0.4.0] - 2026-01-02

### Added

- OAuth authentication with Google
- SAML SSO authentication with Entreefederatie (school accounts)
- ProfileMenu component matching main app UX pattern
- Anonymous authentication for visitors (automatic session creation)
- Auth callback page (`/auth/callback`) for handling OAuth/SAML redirects
- Entreefederatie configuration file (`src/config/entreefederatie.ts`)
- Real-time auth state management with `onAuthStateChange` listener
- PKCE flow for enhanced security in Supabase client
- Automatic `.env` file writing from setup wizard (dev mode only)
- Support for Supabase publishable keys (backward compatible with anon keys)
- Vite plugin for dev-only API endpoints (`vite-plugin-dev-api.ts`)
- "Skip Database Setup" button in setup wizard for auth-only testing

### Changed

- Replaced email/password login form with OAuth/SAML sign-in options
- Updated `LoginPage` to use ProfileMenu pattern
- Updated `MainLayout` to integrate ProfileMenu in navigation bar
- Enhanced Supabase client configuration with proper auth options (persistSession, autoRefreshToken, detectSessionInUrl, PKCE)
- Auth state now updates in real-time via Supabase auth state listener
- Anonymous sessions are automatically created for unauthenticated visitors
- Setup wizard now automatically writes environment variables to `.env` file
- Setup wizard shows clear restart instructions after saving env variables
- Updated terminology from "anon key" to "publishable key" (with backward compatibility)
- Database setup step is now optional (can be skipped for auth-only testing)

### Technical

- Added `signInWithGoogle()` and `signInWithEntreefederatie()` methods to `authService.ts`
- Added `signInAnonymously()` method for visitor sessions
- Added `exchangeCodeForSession()` for OAuth/SAML callback handling
- Updated `useAuth.ts` hook with `onAuthStateChange` listener
- Added `@components` and `@config` path aliases
- Added Vite plugin for dev-mode `.env` file writing
- Supabase service now checks for both `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY`
- Removed temporary console logs (kept only essential error logging)
- Fixed TypeScript type issues and linting errors

## [0.3.3] - 2024-12-23

### Added

- Optional authentication when Supabase is not configured
- Local storage mode with clear user messaging
- Todos page accessible without login when Supabase is not configured
- Info banners explaining local storage mode limitations
- Navigation links for todos when Supabase is not configured

### Changed

- `ProtectedRoute` now allows access without authentication when Supabase is not configured
- Home page shows "Go to Todos" button when Supabase is not configured (even without login)
- Navigation bar shows "Todos" link when Supabase is not configured (even without login)
- Enhanced todos page info message with setup wizard link
- Authentication remains required when Supabase is configured (backward compatible)

### Technical

- Modified `ProtectedRoute` to check `isSupabaseConfigured()` before requiring auth
- Updated `HomePage` and `MainLayout` to conditionally show todos links based on Supabase configuration
- Enhanced user messaging throughout the app for local storage mode

## [0.3.2] - 2025-12-22

### Changed

- Updated README with improved troubleshooting section for TypeScript compilation errors
- Clarified port information in Quick Start guide
- Removed redundant note about cloning instructions

### Fixed

- Fixed floating promise lint errors by properly handling async operations
- Fixed unused variable warnings in browserStorageProvider
- Fixed TypeScript `any` types in test files

## [0.3.1] - 2025-12-22

### Changed

- Updated README cloning instructions to clone directly into current folder for better Cursor indexing
- Fixed ESLint import restriction rules to properly allow pages importing components and feature components importing common components
- Removed console.error statements from error handlers

## [0.3.0] - 2025-01-28

### Added

- Airtable integration as alternative data backend
- Data provider abstraction layer using Strategy pattern
- Airtable configuration step in setup wizard
- Support for multiple data backends (Supabase, Airtable, Browser Storage)
- Automatic provider selection based on configuration priority
- Airtable field mapping utilities for Todo feature
- Environment variables for Airtable configuration (`VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`, `VITE_AIRTABLE_TABLE_ID`)

### Changed

- Refactored todo service to use provider pattern for better extensibility
- Data backend priority: Supabase → Airtable → Browser Storage
- Setup wizard now includes optional Airtable configuration step
- Improved code organization with provider abstraction layer

### Technical

- Added `airtable` npm package dependency
- Created `DataProvider` interface for backend abstraction
- Implemented `SupabaseProvider`, `AirtableProvider`, and `BrowserStorageProvider`
- Provider factory pattern for automatic backend selection

## [0.2.0] - 2025-01-27

### Added

- Optional Supabase configuration - users can skip database setup during initial setup
- Browser storage fallback for todos when Supabase is not configured
- Setup wizard accessible at `/setup` route anytime (until cleanup)
- Info banners in auth pages explaining Supabase requirement
- Info banner in todos page explaining browser storage

### Changed

- Supabase is now optional - app works without database configuration
- Todos feature automatically uses browser storage when Supabase is not configured
- Setup wizard allows skipping Supabase configuration step
- TypeScript types for Supabase environment variables are now optional
- README updated with optional Supabase setup instructions

### Fixed

- TypeScript compilation errors in supabaseService.ts
- Removed unused `handleSkipToTheme` function

## [0.1.0] - 2024-12-21

### Added

- Initial boilerplate setup with Vite, React, TypeScript
- Material-UI (MUI) integration with custom dark mode theme
- Supabase integration for backend services
- React Router for navigation
- Authentication feature (login, signup, logout)
- Todos feature (CRUD operations)
- Common components (Button, Input, Modal)
- Layouts (MainLayout, AuthLayout)
- Protected routes
- TypeScript path aliases for clean imports
- ESLint configuration with GTS and architecture rules
- Prettier configuration
- Vitest testing setup with example tests
- GitHub Actions CI/CD workflow
- Project documentation (README.md, ARCHITECTURE.md)
- Setup wizard for initial configuration
  - Supabase credentials configuration
  - Database schema setup instructions
  - Frontend hosting configuration guide
  - Custom theme configuration step
    - Integration with MUI Theme Creator
    - Theme validation and persistence
    - Default theme preservation
- Theme customization system
  - Custom theme loader with localStorage persistence
  - Theme validation utilities
  - Default theme fallback mechanism


