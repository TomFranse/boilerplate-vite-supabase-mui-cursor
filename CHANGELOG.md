# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Vite plugin for writing environment variables (`vite-plugin-env-writer.ts`)
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


