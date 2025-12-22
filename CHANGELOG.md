# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-12-22

### Changed

- Updated README cloning instructions to clone directly into current folder for better Cursor indexing
- Fixed ESLint import restriction rules to properly allow pages importing components and feature components importing common components
- Removed console.error statements from error handlers

### Fixed

- Fixed floating promise lint errors by properly handling async operations
- Fixed unused variable warnings in browserStorageProvider
- Fixed TypeScript `any` types in test files

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


