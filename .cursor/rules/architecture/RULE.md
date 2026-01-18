---
description: "Architectural patterns and structural organization standards"
alwaysApply: true
---

# Architecture Standards

Architectural patterns, module organization, and structural standards for application design.

## Design Principles

### Separation of Concerns
- Separate business logic from presentation
- Keep data access separate from business logic
- Isolate side effects and I/O operations

### Single Responsibility
- Each module/class has one reason to change
- Functions do one thing well
- Avoid god objects or utility classes with too many responsibilities

### Dependency Management
- Depend on abstractions, not concretions
- Use dependency injection for testability
- Minimize coupling between modules

## Project Structure

### Directory Organization
- Group related files by feature/domain
- Keep shared utilities in common location
- Separate concerns by layer (presentation, business, data)

### Module Boundaries
- Define clear interfaces between modules
- Avoid circular dependencies
- Use explicit imports and exports
- Avoid importing from `index.ts` within the same module (causes circular deps)
- Pages: Barrel files (`index.ts`) not allowed in `pages/` - use direct imports only

## Code Placement Rules

Follow these rules. If code doesn't meet criteria for a layer, move to the next one.

### Component Rule (UI Only)
Component files contain only:
- JSX (Layout)
- Event handlers that call other functions
- Local UI state (e.g., `isOpen`, `isHovered`)
- Zero data fetching, zero complex math, zero business logic

### Hook Rule (Orchestration)
Logic requiring React lifecycle (`useEffect`, `useState`, `useContext`) lives in a hook:
- Feature Hooks: Logic specific to one feature
- Global Hooks: Reusable logic

### Service/Util Rule (Logic Only)
Logic not requiring React lifecycle must not be in a component or hook:
- Put it in a standard `.js` or `.ts` file
- Makes logic portable and testable without a DOM

### One-Way Directory Rule
Code imports only from "lower" levels:
- Component imports Hook, Hook never imports Component
- Services import from utils, utils never import from services
- Maintain clear dependency hierarchy

### Service-Helper Extraction Pattern
When extracting helper functions from a service:

**Types First Principle:**
- All types shared between service and helpers defined in dedicated types file
- Services may re-export types for external API consumers
- Helpers import types from types file, never from service files
- Helpers never import runtime code from the service they support

**Dependency Flow:**
```
types/index.ts ← services/*.ts
      ↑                ↓
      └─────── utils/*Helpers.ts
```

**Why:**
- Prevents circular dependencies during complexity reduction
- Makes types reusable without coupling to implementation
- Types are the foundation layer
- Applies universally to any feature/module extracting helpers

## Standard Folder Structure

Standardize project structure using this map. New files have a pre-determined home:

```
src/
├── assets/       # Static files (images, fonts, global CSS)
├── components/   # UI components
│   └── common/   # "Dumb" UI components (Button, Input, Modal) - No business logic
├── features/     # Feature-based organization (grouped by domain)
│   └── [feature-name]/
│       ├── components/  # Feature-specific UI
│       ├── hooks/       # Feature-specific logic
│       ├── services/    # Pure functions / API calls
│       ├── types/       # Feature-specific type definitions
│       ├── context/     # Feature-specific context providers
│       └── store/       # Feature-specific state slices
├── shared/       # Cross-cutting concerns (used across multiple features)
│   ├── hooks/    # Global hooks (useAuth, useLayout, useLocalStorage)
│   ├── services/ # Shared services (errorReporting, API clients)
│   ├── utils/    # Global utilities (date formatters, currency math, validators)
│   ├── types/    # Shared type definitions
│   ├── context/  # Cross-feature context providers
│   └── theme/    # Theme configuration and design tokens
├── layouts/      # Page wrappers (Header/Footer/Sidebar)
├── pages/        # Route-level components (only used for routing/connecting features)
├── routes/       # Route definitions and guards
├── store/        # Global state composition (Redux/Zustand/Context setup)
├── config/       # Configuration files
└── lib/          # Third-party library wrappers and integrations
```

### Folder Purpose Clarification

**`components/common/`** vs **`shared/`**:

- **`components/common/`**: Presentation-only, reusable UI components
  - Contains: Button, Input, Modal, Card, etc.
  - Rule: Zero business logic, zero data fetching, zero feature-specific code
  - Used by: Any feature or page that needs basic UI elements

- **`shared/`**: Cross-cutting logic and utilities used across features
  - Contains: hooks, services, utils, types, context, theme
  - Rule: Reusable logic that doesn't belong to a specific feature
  - Used by: Multiple features need the same functionality
  - Examples: `shared/hooks/useAuth`, `shared/utils/formatDate`, `shared/services/errorReporting`

### Backend/Server-Side Structure

**Supabase Edge Functions:**
- Location: `supabase/functions/`
- Each function is a subdirectory: `supabase/functions/<function-name>/index.ts`
- Shared utilities: `supabase/functions/_shared/`
- Deploy via: `supabase functions deploy <function-name>`

**Other Cloud/Edge Functions** (Cloud Run, Railway, etc.):
- Location: `cloud-functions/<service-name>/`
- Separate from Supabase Edge Functions, use different runtimes (Node.js, etc.)

## Logic Decision Flowchart

When writing code, ask these questions in order:
1. Is it a pure calculation? → `shared/utils/` (if used by multiple features) or `features/*/services/` (if feature-specific)
2. Does it fetch data or talk to an API? → `features/*/services/` (feature-specific) or `shared/services/` (cross-feature)
3. Does it use `useEffect` or `useState`? → `features/*/hooks/` (feature-specific) or `shared/hooks/` (cross-feature)
4. Is it a generic UI element? → `components/common/`
5. Does it connect multiple features or define a URL? → `pages/`

## Architecture Rules Are Immutable

**Do not modify architecture rules without explicit user consent and understanding**

### Rule Modification Policy

1. Architecture rules are not changed when violations are detected
2. Violations indicate the code is wrong, not that the rules are wrong
3. If a user requests rule changes, you must:
   - Issue a clear warning that modifying architecture rules will:
     - Destroy architectural consistency across the application
     - Break the enforcement system's purpose (preventing bad patterns)
     - Create technical debt and inconsistency
     - Potentially violate architectural principles shared with other applications
   - Only proceed when the user demonstrates clear understanding of these consequences
   - Document why the rule was changed and what architectural decision was made

### When Violations Are Detected

- Report violations clearly to the user
- Suggest fixing the code to match the rules
- Explain what the rule enforces and why
- Do not automatically adjust rules to match existing violations
- Do not change rules without explicit user request
- Do not change rules without warning about consequences

## Automated Architecture Enforcement

Project uses automated architecture enforcement via ESLint + Dependency-Cruiser. Rules enforced at code level, preventing violations before commit.

### Enforcement Tools

| Tool | Purpose | When It Runs |
|------|---------|--------------|
| `project-structure-validator.js` | Folder structure whitelist enforcement | CLI (pre-commit + CI/CD) |
| `eslint-plugin-boundaries` | Layer boundary enforcement | Real-time (IDE + pre-commit) |
| `eslint-plugin-import` | Circular dependency prevention, import ordering | Real-time (IDE + pre-commit) |
| `dependency-cruiser` | Deep analysis, stakeholder reports, CI validation | CI/CD + on-demand |

### Import Direction (Downward Only)

```
pages → components → hooks → services → utils → types
```

Never import upward (e.g., hooks cannot import from components).

### Layer Rules

| Layer | Can Import From | Cannot Import From |
|-------|-----------------|-------------------|
| `pages` | components, hooks, services, utils, types, routes, config | — |
| `routes` | pages, components, hooks, types | services |
| `components` | hooks, services, utils, types, config | pages, routes |
| `hooks` | services, utils, types | pages, routes, components |
| `services` | utils, types, config | pages, routes, components, hooks, **features** |
| `utils` | types | everything else |
| `types` | nothing | everything |
| `config` | types | everything else |

### Folder Structure Whitelist

**Critical:** Project uses a whitelist approach for folder structure. Any folder or file not explicitly defined in `projectStructure.config.js` triggers an ESLint error.

**Do not modify `projectStructure.config.js`** to accommodate existing violations. Fix the code structure instead, or follow the rule modification policy above if architectural changes are truly needed.

**What Gets Enforced:**
- Root level folders: Only predefined folders (`src/`, `public/`, `documentation/`, etc.)
- `src/` structure: Only predefined subfolders (`pages/`, `components/`, `shared/`, etc.)
- File naming: Enforced naming conventions per folder type
- File extensions: Enforced extensions per folder type

**Project Structure Validation:**

Use `pnpm validate:structure` to validate:
- Root-level files and folders
- Nested folder structures recursively
- All file types (including files without extensions, binary files, etc.)
- File extensions match allowed patterns per folder

**Configuration:** See `projectStructure.config.js` for complete structure definition.

**Related Files:**
- `scripts/project-structure-validator.js` - Main validator implementation
- `projectStructure.config.js` - Structure configuration file
- `package.json` - Scripts that call the validator
- `documentation/PROJECT-STRUCTURE-VALIDATION.md` - User documentation
- `architecture.md` - Architecture documentation
- `.cursor/rules/file-placement/RULE.md` - File placement rules

### Path Aliases (Required)

**SSOT:** This section is the Single Source of Truth for all path alias definitions. Other rules reference this section.

**Always use path aliases with `@/` prefix** - never relative parent imports (`../`):

- `@/components/*` → `src/components/*`
- `@/pages/*` → `src/pages/*`
- `@/hooks/*` → `src/shared/hooks/*`
- `@/services/*` → `src/shared/services/*`
- `@/utils/*` → `src/shared/utils/*`
- `@/types/*` → `src/shared/types/*`
- `@/config/*` → `src/config/*`
- `@/context/*` → `src/shared/context/*`
- `@/theme/*` → `src/shared/theme/*`
- `@/routes/*` → `src/routes/*`
- `@/lib/*` → `src/lib/*`
- `@/ai-capabilities/*` → `src/ai-capabilities/*`

Use path aliases, not relative imports.

### When ESLint Shows "boundaries/element-types" Error

This means importing from a forbidden layer. Solutions:
1. Move the code to the appropriate layer
2. Create a hook to bridge the gap
3. Extract shared logic to utils/services

### Exception Handling

For legitimate cross-layer imports (rare cases), use ESLint disable comments with required justification:
- Exceptions require code review approval
- Must include justification comment
- Must reference ticket/issue
- Review exceptions quarterly for removal

### Baseline Approach

- Existing violations: Ignored via baseline (`.dependency-cruiser-baseline.json`)
- New violations: Will be flagged and must be fixed
- Gradual remediation: Fix violations incrementally over time

### Architecture Checking Commands

**Full Validation (Comprehensive):**
- `pnpm validate:all` - Full structure + architecture check
- `pnpm validate:structure` - Full structure validation
- `pnpm arch:check` - Full architecture check
- `pnpm arch:check:ci` - CI-friendly verbose output
- `pnpm arch:graph` - Generate SVG dependency graph
- `pnpm arch:graph:html` - Generate HTML report for stakeholders
- `pnpm arch:validate` - Full validation (lint + architecture)
- `pnpm lint:arch` - ESLint architecture rules only

**Staged Files Only (Fast, for commits):**
- `pnpm validate:all:staged` - Staged structure + architecture check
- `pnpm validate:structure:staged` - Staged structure validation only
- `pnpm arch:check:staged` - Architecture check (runs full, but reports staged)

**Note:** Pre-commit hook automatically runs staged checks. Use full validation commands for comprehensive checks before major changes or when troubleshooting.

### Legacy Enforcement (Still Valid)

- Folder Peeking: If a folder has more than 10 files, it must be broken down into sub-folders

## Patterns

### Component Patterns
- Prefer composition over inheritance
- Use functional components with hooks
- Keep components focused and reusable

### State Management
- Keep state as local as possible
- Lift state up only when necessary
- Use appropriate state management solutions

### Layout and Shared Dimensions
When multiple components must share a dimension or position:
- Avoid duplicated magic numbers
- Use a single source of truth and propagate values
- Default: Parent component holds the value and passes it via props
- When deeply nested or widely shared: Use React Context or another shared mechanism if clearly beneficial
- Exact placement of the source of truth can vary per feature; choose the most logical owner each time

### Error Handling
- Handle errors at appropriate boundaries
- Provide meaningful error messages
- Log errors for debugging

## Edge Case Placement Guide

When code doesn't clearly fit existing categories, use these guidelines:

### Layout-Specific Logic
- Hooks for layout state (sidebar, header scroll, etc.): `shared/hooks/useLayout*.ts`
- Layouts import these hooks; they don't own them

### Page Complexity Threshold
- If a page needs its own hooks/services, promote it to a feature
- Pages should remain thin (routing + feature composition only)

### Validation Schemas
- Domain-specific: `features/*/types/*.schema.ts`
- Generic validators: `shared/utils/validation/`

### State Management
- Feature state slices: `features/*/store/`
- Composition/setup: `store/index.ts`
- Cross-feature state: `shared/context/`

### Route Guards
- Location: `routes/guards/`
- Auth logic sourced from `shared/hooks/useAuth` or `features/auth/`

### Notifications/Toasts
- Full feature: `features/notifications/`
- Not split across common + shared

### Error Boundaries
- Component: `components/common/ErrorBoundary/`
- Reporting service: `shared/services/errorReporting.ts`

### Keyboard Shortcuts
- Global shortcuts: `shared/hooks/useHotkeys.ts`
- Feature shortcuts: `features/*/hooks/use*Shortcuts.ts`

### Cross-Feature Data Transforms
- Consumer feature owns the transform
- If 2+ consumers: extract to `shared/utils/transformers/`

### API Response Normalizers
- Co-locate with API calls in `features/*/services/`
- Only truly shared normalizers go in `shared/services/`

### Feature Context (App-Wide Usage)
- Keep provider in `features/*/context/`
- Export via feature barrel (barrel files allowed in features, NOT in pages)
- Compose providers in `App.tsx`

### Drag & Drop
- Infrastructure: `shared/context/DndContext.tsx` + `shared/hooks/useDnd.ts`
- Domain actions: respective feature's hooks

## Architecture Documentation

### Documentation Maintenance
- Maintain architecture documentation for all projects
- Update architecture documentation after structural changes
- Keep documentation in sync with actual implementation
- Use clear, descriptive section headings

### Documentation Location
- `ARCHITECTURE.md` and `CHANGELOG.md` must be in project root directory (not in `documentation/` folder)
- These files are project-wide references that need to be easily discoverable
- Root location follows standard conventions (Keep a Changelog format) and ensures README references work correctly
- If these files are found in wrong location (e.g., `documentation/` folder), they must be moved to root directory
- Other project-specific documentation can be stored in `documentation/` folder (e.g., implementation plans, job-specific docs)
- Document major architectural decisions and patterns
- Include diagrams or visual representations when helpful
- Keep documentation up to date with code changes

### When to Update Documentation
- After adding new features or modules
- After refactoring major components
- After changing architectural patterns
- After adding new dependencies or frameworks
- When architectural decisions change

## Examples

### Good Example
Clear separation: data access, business logic, presentation:
- Data repository interface defines data access contract
- Service class uses repository interface (dependency injection)
- Component uses service, handles UI state and rendering

### Bad Example
Everything mixed together, no separation:
- Component directly fetches data
- Business logic mixed with presentation
- No separation of concerns

## Complexity Reduction and Architecture

When reducing code complexity through refactoring, all changes must comply with architecture rules:

### Architecture-Aware Complexity Reduction

**Key Principles:**
- Complexity reduction refactorings must respect layer boundaries
- Extracted code must be placed in correct layer per architecture rules
- All imports must use path aliases (`@/` prefix) - never relative parent imports
- Folder structure whitelist must be respected (or updated if new folder needed)

**Refactoring Workflow:**
1. Identify complexity violations (cyclomatic > 10, cognitive > 15, nesting > 4, etc.)
2. Determine target layer for extracted code (utils/services/hooks per architecture rules)
3. Check folder whitelist - use existing folder or update `projectStructure.config.js` first
4. Extract code using appropriate refactoring technique
5. Use path aliases for all imports
6. Verify layer boundaries after extraction
7. Run `pnpm lint:arch` to verify architecture compliance

**For detailed guidance:** See `.cursor/commands/complexity-reduce.md` section 8 (Architecture Compliance)

**For unified checklist:** See `documentation/REFACTORING-CHECKLIST.md`

## Related Rules

**When modifying this rule, check these rules for consistency:**
- `code-style/RULE.md` - Naming conventions for architectural elements
- `testing/RULE.md` - Testing patterns that depend on architecture
- `security/RULE.md` - Security boundaries and architectural patterns
- `workflow/RULE.md` - Code review standards for architecture
- `cloud-functions/RULE.md` - Function organization patterns
- `.cursor/commands/complexity-reduce.md` - Complexity reduction (must comply with architecture rules)

**SSOT Status:**
- This rule is the SSOT for:
  - Project structure and directory organization
  - Path alias definitions (`@/hooks/*`, `@/components/*`, etc.)
  - Code placement and layer boundaries
  - `common/` vs `shared/` folder distinction
- Other rules reference this rule for structure guidelines
- `code-style/RULE.md` references this rule for path aliases instead of duplicating them
- Complexity reduction rules reference this rule for architecture compliance

**Rules that reference this rule:**
- All other rules may reference architectural patterns
- `cloud-functions/RULE.md` - References this rule as SSOT for function location
- `.cursor/commands/complexity-reduce.md` - References this rule for architecture compliance during refactoring
