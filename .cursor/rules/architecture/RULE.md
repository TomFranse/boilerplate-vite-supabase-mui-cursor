---
description: "Architectural patterns and structural organization standards"
alwaysApply: true
---

# Architecture Standards

## Purpose

This rule defines architectural patterns, module organization, and structural standards for application design.

## Design Principles

### Separation of Concerns
- Separate business logic from presentation
- Keep data access separate from business logic
- Isolate side effects and I/O operations

### Single Responsibility
- Each module/class should have one reason to change
- Functions should do one thing well
- Avoid god objects or utility classes with too many responsibilities

### Dependency Management
- Depend on abstractions, not concretions
- Use dependency injection for testability
- Minimize coupling between modules

## Project Structure

### Directory Organization
- Group related files by feature/domain
- Keep shared utilities in a common location
- Separate concerns by layer (presentation, business, data)

### Module Boundaries
- Define clear interfaces between modules
- Avoid circular dependencies
- Use explicit imports and exports
- **Barrel exports**: Avoid importing from `index.ts` within the same module (causes circular deps)
- **Pages**: Barrel files (`index.ts`) are NOT allowed in `pages/` - use direct imports only (e.g., `import { ChatPage } from '@/pages/chat/ChatPage'`)

## Code Placement Rules (Strict Placement)

Follow these four rules. If a piece of code doesn't meet the criteria for a layer, it must move to the next one.

### 1. The Component Rule (UI Only)
A component file should only contain:
- JSX (Layout)
- Event handlers that call other functions
- Local UI state (e.g., `isOpen`, `isHovered`)
- **Zero** data fetching, **zero** complex math, and **zero** business logic

### 2. The Hook Rule (Orchestration)
If logic requires a React lifecycle (`useEffect`, `useState`, `useContext`), it must live in a hook:
- **Feature Hooks**: Logic specific to one feature (e.g., `useCartCalculation`)
- **Global Hooks**: Reusable logic (e.g., `useLocalStorage`, `useWindowSize`)

### 3. The Service/Util Rule (Logic Only)
If logic does not require a React lifecycle, it must not be in a component or a hook:
- Put it in a standard `.js` or `.ts` file
- **Why**: This makes the logic portable and testable without a DOM

### 4. The "One-Way" Directory Rule
Code can only import from "lower" levels:
- A Component can import a Hook, but a Hook can never import a Component
- Services can import from utils, but utils cannot import from services
- Maintain clear dependency hierarchy

### 5. The Service-Helper Extraction Pattern
When extracting helper functions from a service to reduce complexity:

**Types First Principle:**
- ALL types shared between service and helpers MUST be defined in a dedicated types file
- Services may re-export types for external API consumers (backward compatibility)
- Helpers MUST import types from the types file, NEVER from service files
- Never Upward: Helpers never import runtime code from the service they support

**Dependency Flow:**
```
types/index.ts ← services/*.ts
      ↑                ↓
      └─────── utils/*Helpers.ts
```

**Why This Matters:**
- Prevents circular dependencies during complexity reduction
- Makes types reusable without coupling to implementation
- Follows the principle: "Types are the foundation layer"
- Applies universally: any feature/module extracting helpers must follow this pattern

**Example Violation:**
```typescript
// ❌ BAD: Creates circular dependency
// services/imageService.ts
export interface ImageOptions { ... }
export function generateImage() { ... }

// utils/imageServiceHelpers.ts
import type {ImageOptions} from '@/services/imageService'; // Cycle!
```

**Example Correct Pattern:**
```typescript
// ✅ GOOD: Types in foundation layer
// types/index.ts
export interface ImageOptions { ... }

// services/imageService.ts
import type {ImageOptions} from '@/types';
export type {ImageOptions}; // Re-export for API consumers
export function generateImage() { ... }

// utils/imageServiceHelpers.ts
import type {ImageOptions} from '@/types'; // No cycle!
```

## Standard Folder Structure

Standardize your project structure using this exact map. If you create a new file, it has a pre-determined home:

```
src/
├── assets/       # Static files (images, fonts, global CSS)
├── components/   # UI components
│   └── common/   # "Dumb" UI components (Button, Input, Modal) - No business logic allowed
├── features/     # THE CORE - Feature-based organization (grouped by domain)
│   └── [feature-name]/
│       ├── components/  # Feature-specific UI
│       ├── hooks/       # Feature-specific logic (useBillingData)
│       ├── services/    # Pure functions / API calls (billingApi)
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
  - Examples:
    - `shared/hooks/useAuth` - Authentication logic used everywhere
    - `shared/utils/formatDate` - Date formatting used by multiple features
    - `shared/services/errorReporting` - Error reporting used app-wide

### Backend/Server-Side Structure

**Supabase Edge Functions:**
- Location: `supabase/functions/`
- Each function is a subdirectory: `supabase/functions/<function-name>/index.ts`
- Shared utilities: `supabase/functions/_shared/`
- Deploy via: `supabase functions deploy <function-name>`

**Other Cloud/Edge Functions** (Cloud Run, Railway, etc.):
- Location: `cloud-functions/<service-name>/`
- Example: `cloud-functions/greenpt-proxy/` for Cloud Run/Railway deployments
- These are separate from Supabase Edge Functions and use different runtimes (Node.js, etc.)

## Logic Decision Flowchart

When you write a line of code, ask these questions in order:
1. Is it a pure calculation? (e.g., formatting a price) → `shared/utils/` (if used by multiple features) or `features/*/services/` (if feature-specific)
2. Does it fetch data or talk to an API? → `features/*/services/` (feature-specific) or `shared/services/` (cross-feature)
3. Does it use `useEffect` or `useState`? → `features/*/hooks/` (feature-specific) or `shared/hooks/` (cross-feature)
4. Is it a generic UI element (like a blue button)? → `components/common/`
5. Does it connect multiple features or define a URL? → `pages/`

## ⚠️ CRITICAL: Architecture Rules Are Immutable

**DO NOT MODIFY ARCHITECTURE RULES WITHOUT EXPLICIT USER CONSENT AND UNDERSTANDING**

### Rule Modification Policy

1. **Architecture rules are NOT to be changed** when violations are detected
2. **Violations indicate the code is wrong**, not that the rules are wrong
3. **If a user requests rule changes**, you MUST:
   - **Issue a clear warning** that modifying architecture rules will:
     - Destroy architectural consistency across the application
     - Break the enforcement system's purpose (preventing bad patterns)
     - Create technical debt and inconsistency
     - Potentially violate architectural principles shared with other applications
   - **Only proceed** when the user demonstrates clear understanding of these consequences
   - **Document** why the rule was changed and what architectural decision was made

### When Violations Are Detected

- ✅ **DO**: Report violations clearly to the user
- ✅ **DO**: Suggest fixing the code to match the rules
- ✅ **DO**: Explain what the rule enforces and why
- ❌ **DON'T**: Automatically adjust rules to match existing violations
- ❌ **DON'T**: Change rules without explicit user request
- ❌ **DON'T**: Change rules without warning about consequences

### Example Warning Message

If a user requests rule changes, respond with:

> ⚠️ **ARCHITECTURE RULE MODIFICATION WARNING**
> 
> Modifying architecture enforcement rules will:
> - Break architectural consistency across the application
> - Undermine the enforcement system's purpose
> - Create technical debt and inconsistency
> - Potentially violate shared architectural principles
> 
> **Are you certain you want to proceed?** Please confirm you understand these consequences and explain why the rule change is architecturally necessary.

## Automated Architecture Enforcement

This project uses **automated architecture enforcement** via ESLint + Dependency-Cruiser. Rules are enforced at the code level, preventing violations before commit—not during code review.

### Enforcement Tools

| Tool | Purpose | When It Runs |
|------|---------|--------------|
| `project-structure-validator.js` | **Folder structure whitelist enforcement** | CLI (pre-commit + CI/CD) |
| `eslint-plugin-boundaries` | Layer boundary enforcement | Real-time (IDE + pre-commit) |
| `eslint-plugin-import` | Circular dependency prevention, import ordering | Real-time (IDE + pre-commit) |
| `dependency-cruiser` | Deep analysis, stakeholder reports, CI validation | CI/CD + on-demand |

### Import Direction (Downward Only)

```
pages → components → hooks → services → utils → types
```

**NEVER import upward** (e.g., hooks cannot import from components).

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

**Critical:** This project uses a **whitelist approach** for folder structure. Any folder or file not explicitly defined in `projectStructure.config.js` will trigger an ESLint error.

**⚠️ DO NOT MODIFY `projectStructure.config.js`** to accommodate existing violations. Fix the code structure instead, or follow the rule modification policy above if architectural changes are truly needed.

**What Gets Enforced:**
- Root level folders: Only predefined folders (`src/`, `public/`, `documentation/`, etc.)
- `src/` structure: Only predefined subfolders (`pages/`, `components/`, `shared/`, etc.)
- File naming: Enforced naming conventions per folder type
- File extensions: Enforced extensions per folder type

**Example Violations:**
- Creating `backup/` or `backups/` folders → ESLint error
- Creating `src/random-folder/` → ESLint error
- Wrong file extension in components → ESLint error

**Project Structure Validation:**

This project uses a unified project structure validator (`scripts/project-structure-validator.js`) that validates the entire project structure, including all file types (parseable and non-parseable).

**To validate project structure**, use:
```bash
pnpm validate:structure
```

This command validates:
- Root-level files and folders
- Nested folder structures recursively
- All file types (including files without extensions, binary files, etc.)
- File extensions match allowed patterns per folder

**Configuration:** See `projectStructure.config.js` for complete structure definition.

For more details, see `documentation/PROJECT-STRUCTURE-VALIDATION.md`.

**Related Files:**
When updating this section, also check:
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

```typescript
// ✅ CORRECT
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";

// ❌ WRONG
import { Button } from "../../components/common/Button"; // Use path alias
import { useAuth } from "../../shared/hooks/useAuth"; // Use path alias
```

### When ESLint Shows "boundaries/element-types" Error

This means you're importing from a forbidden layer. Solutions:
1. Move the code to the appropriate layer
2. Create a hook to bridge the gap
3. Extract shared logic to utils/services

### Exception Handling

For legitimate cross-layer imports (rare cases), use ESLint disable comments with required justification:

```typescript
// eslint-disable-next-line boundaries/element-types -- 
// EXCEPTION: Direct service access required for real-time subscription management
// Approved by: [Name] on [Date]
// Ticket: [JIRA-123]
import { realtimeService } from "@/services/realtime";
```

**Exception Policy:**
1. Exceptions require code review approval
2. Must include justification comment
3. Must reference ticket/issue
4. Review exceptions quarterly for removal

### Baseline Approach

- **Existing violations**: Ignored via baseline (`.dependency-cruiser-baseline.json`)
- **New violations**: Will be flagged and must be fixed
- **Gradual remediation**: Fix violations incrementally over time

### Architecture Checking Commands

**Full Validation (Comprehensive):**
```bash
pnpm validate:all              # Full structure + architecture check
pnpm validate:structure        # Full structure validation
pnpm arch:check                # Full architecture check
pnpm arch:check:ci             # CI-friendly verbose output
pnpm arch:graph                # Generate SVG dependency graph
pnpm arch:graph:html           # Generate HTML report for stakeholders
pnpm arch:validate             # Full validation (lint + architecture)
pnpm lint:arch                 # ESLint architecture rules only
```

**Staged Files Only (Fast, for commits):**
```bash
pnpm validate:all:staged       # Staged structure + architecture check
pnpm validate:structure:staged # Staged structure validation only
pnpm arch:check:staged         # Architecture check (runs full, but reports staged)
```

**Note:** Pre-commit hook automatically runs staged checks. Use full validation commands for comprehensive checks before major changes or when troubleshooting.

### Legacy Enforcement (Still Valid)

- **Folder Peeking**: If a folder has more than 10 files, it is required to be broken down into sub-folders

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
- **Default**: Parent component holds the value and passes it via props
- **When deeply nested or widely shared**: Use React Context or another shared mechanism if clearly beneficial
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
- **REQUIRED**: Maintain architecture documentation for all projects
- Update architecture documentation after structural changes
- Keep documentation in sync with actual implementation
- Use clear, descriptive section headings

### Documentation Location
- **ARCHITECTURE.md** and **CHANGELOG.md** must be in the project root directory (not in `documentation/` folder)
- These files are project-wide references that need to be easily discoverable
- The root location follows standard conventions (Keep a Changelog format) and ensures README references work correctly
- **If these files are found in the wrong location (e.g., `documentation/` folder), they must be moved to the root directory**
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

### ✅ Good Example

```typescript
// Clear separation: data access, business logic, presentation
// data/userRepository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// domain/userService.ts
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    return user;
  }
}

// presentation/UserComponent.tsx
export function UserComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    userService.getUser(userId).then(setUser);
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

### ❌ Bad Example

```typescript
// Bad: Everything mixed together, no separation
export function UserComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        // Business logic mixed with presentation
        if (data.status === "active") {
          setUser(data);
        }
      });
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

---

## Complexity Reduction and Architecture

When reducing code complexity through refactoring, all changes **MUST** comply with architecture rules:

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
- This rule is the **SSOT** for:
  - Project structure and directory organization
  - Path alias definitions (`@/hooks/*`, `@/components/*`, etc.)
  - Code placement and layer boundaries
  - `common/` vs `shared/` folder distinction
- Other rules reference this rule for structure guidelines (e.g., `cloud-functions/RULE.md` references function location)
- `code-style/RULE.md` references this rule for path aliases instead of duplicating them
- Complexity reduction rules reference this rule for architecture compliance

**Rules that reference this rule:**
- All other rules may reference architectural patterns
- `cloud-functions/RULE.md` - References this rule as SSOT for function location
- `.cursor/commands/complexity-reduce.md` - References this rule for architecture compliance during refactoring

