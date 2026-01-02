# Architecture Guide

This document explains the architectural decisions and rules enforced in this boilerplate.

## Folder Structure

```
src/
├── assets/              # Static assets (images, global CSS)
│   └── styles/
│       └── global.css
├── common/              # Reusable UI components (pure components)
│   ├── Button/
│   ├── Input/
│   └── Modal/
├── components/          # App-level components (ProfileMenu, ProtectedRoute, etc.)
├── config/              # Configuration files (Entreefederatie, etc.)
├── features/            # Feature modules (business logic)
│   ├── auth/
│   │   ├── components/  # Feature-specific UI components
│   │   ├── hooks/       # React hooks for feature logic
│   │   ├── services/    # Pure functions, API calls
│   │   └── types/       # TypeScript types for feature
│   └── todos/
├── layouts/             # Layout components (MainLayout, AuthLayout)
├── pages/               # Route-level page components
├── store/               # Global state management
│   └── contexts/        # React contexts (AuthContext, etc.)
├── shared/              # Shared across features
│   ├── services/        # Shared services (Supabase client, Airtable client, data providers)
│   │   └── dataProviders/  # Data provider implementations (Strategy pattern)
│   ├── types/           # Shared types
│   └── theme/           # MUI theme configuration
│       ├── defaultTheme.ts    # Default theme (preserved)
│       ├── themeLoader.ts      # Theme loading and persistence
│       └── theme.ts            # Theme export (uses loader)
└── utils/               # Utility functions
```

## Layer Rules

### Dependency Hierarchy

```
Pages → Components → Hooks → Services → Shared Services
```

**Rules:**
1. **Pages** can import from: Components, Hooks, Layouts, Store
2. **Components** can import from: Common components, Hooks (same feature), Types
3. **Hooks** can import from: Services (same feature), Types
4. **Services** can import from: Shared services, Types
5. **Common components** cannot import from features
6. **Components** cannot import from services directly (use hooks)

### Import Patterns

Use path aliases for clean imports:

```typescript
// ✅ Good
import { Button } from "@common/Button";
import { useAuth } from "@features/auth/hooks/useAuth";
import { supabase } from "@shared/services/supabaseService";

// ❌ Bad
import { Button } from "../../../common/Button";
import { useAuth } from "../../hooks/useAuth";
```

## Feature Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/      # UI components specific to this feature
├── hooks/          # React hooks that use services
├── services/       # Pure functions, API calls, business logic
└── types/          # TypeScript types for this feature
```

### Example: Auth Feature

**Types** (`types/auth.types.ts`):
```typescript
export interface User {
  id: string;
  email: string;
}
```

**Service** (`services/authService.ts`):
```typescript
// Pure functions, no React hooks
export const login = async (credentials) => {
  // Call Supabase, return data
};
```

**Hook** (`hooks/useAuth.ts`):
```typescript
// Uses React hooks, calls services
export const useAuth = () => {
  const [user, setUser] = useState(null);
  // Call authService.login()
};
```

**Component** (`components/LoginForm.tsx`):
```typescript
// UI only, uses hooks
export const LoginForm = () => {
  const { login } = useAuth();
  // Render form
};
```

**Page** (`pages/LoginPage.tsx`):
```typescript
// Route-level, composes components
export const LoginPage = () => {
  return <LoginForm />;
};
```

## Code Placement Rules

### Where to Put Code

| What | Where |
|------|-------|
| Reusable UI component (no logic) | `common/` |
| Feature-specific UI component | `features/[feature]/components/` |
| React hook with state | `features/[feature]/hooks/` |
| Pure function, API call | `features/[feature]/services/` |
| TypeScript types | `features/[feature]/types/` |
| Route-level component | `pages/` |
| Layout wrapper | `layouts/` |
| Global state (Context) | `store/contexts/` |
| Shared service (Supabase, Airtable, data providers) | `shared/services/` |
| Data provider implementation | `shared/services/dataProviders/` |
| Utility function | `utils/` |

### Examples

**✅ Correct:**

```typescript
// features/todos/components/TodoItem.tsx
import { useTodos } from "../hooks/useTodos";  // ✅ Same feature
import { Button } from "@common/Button";        // ✅ Common component

// features/todos/hooks/useTodos.ts
import * as todoService from "../services/todoService";  // ✅ Same feature
import { supabase } from "@shared/services/supabaseService";  // ✅ Shared
```

**❌ Incorrect:**

```typescript
// features/todos/components/TodoItem.tsx
import * as todoService from "../services/todoService";  // ❌ Component importing service
import { useAuth } from "@features/auth/hooks/useAuth";  // ❌ Cross-feature import (use context instead)

// common/Button/Button.tsx
import { useTodos } from "@features/todos/hooks/useTodos";  // ❌ Common importing feature
```

## Code Quality Tools

This project uses three complementary tools for code quality and formatting: **GTS**, **ESLint**, and **Prettier**. Understanding their roles and how they work together is crucial for maintaining code consistency.

### The Three Tools

#### 1. **ESLint** (The Engine)
- **Purpose**: Static code analysis tool that identifies bugs, enforces code quality, and catches potential errors
- **What it checks**: Logic errors, unused variables, type issues, best practices, code smells
- **Examples**: `no-var` (enforces `let`/`const`), `eqeqeq` (enforces `===`), `no-floating-promises` (catches unhandled promises)

#### 2. **GTS** (Google TypeScript Style - The Configuration)
- **Purpose**: Google's opinionated TypeScript style guide that provides a pre-configured ESLint setup
- **What it provides**: 
  - Pre-configured ESLint rules following Google's standards
  - TypeScript-specific linting rules via `typescript-eslint`
  - Integration with Prettier (includes `eslint-config-prettier` and `eslint-plugin-prettier`)
  - Code quality rules like `prefer-const`, `block-scoped-var`, `prefer-arrow-callback`
- **Why we use it**: Provides a solid, battle-tested foundation of code quality rules without manual configuration

#### 3. **Prettier** (The Formatter)
- **Purpose**: Opinionated code formatter that automatically formats code for consistency
- **What it handles**: Indentation, quotes, line breaks, spacing, semicolons, trailing commas
- **Why we use it**: Eliminates formatting debates and ensures consistent code style across the entire codebase

### Why Use All Three?

Each tool serves a distinct purpose:

- **GTS**: Provides comprehensive code quality rules (Google's standards)
- **ESLint**: Allows custom rules (like our architecture enforcement rules)
- **Prettier**: Handles all formatting concerns (ensures consistent style)

Together, they provide:
- ✅ **Code Quality**: GTS + ESLint catch bugs and enforce best practices
- ✅ **Architecture Enforcement**: Custom ESLint rules prevent architectural violations
- ✅ **Consistent Formatting**: Prettier ensures uniform code style

### How They Work Together

The configuration hierarchy:

```
GTS (base rules) → Custom ESLint rules → Prettier (formatting)
```

1. **GTS** provides the foundation of code quality rules
2. **Custom ESLint rules** (in `eslint.config.js`) add project-specific architecture enforcement
3. **Prettier** handles all formatting, and ESLint defers to it via `eslint-config-prettier`

### Configuration Details

**Prettier Configuration** (`.prettierrc.json`):
- Uses **double quotes** (`"singleQuote": false`)
- 100 character line width
- 2 space indentation
- LF line endings (Unix-style)

**ESLint Configuration** (`eslint.config.js`):
- Extends GTS configuration
- Overrides GTS's quote rule to match Prettier (double quotes)
- Adds custom architecture enforcement rules

**Important**: GTS includes `eslint-config-prettier` internally, but it also sets `quotes: ['warn', 'single']` which conflicts with Prettier's double quotes. We override this in our config to ensure consistency:

```javascript
rules: {
  // Override GTS's quote rule to match Prettier (double quotes)
  quotes: ['warn', 'double', { avoidEscape: true }],
  // ... custom rules
}
```

### Workflow

1. **During Development**: 
   - Your editor should format on save using Prettier
   - ESLint provides real-time feedback in your IDE
   - **Editor Setup**: 
     - **VS Code/Cursor**: Install "Prettier" and "ESLint" extensions, enable "Format on Save"
     - **Other editors**: Configure Prettier and ESLint plugins to run on save

2. **Before Committing**:
   - Run `pnpm format` to format all files with Prettier
   - Run `pnpm lint` to check for code quality issues
   - Run `pnpm lint:fix` to auto-fix ESLint issues

3. **In CI/CD**:
   - `pnpm format:check` ensures code is formatted
   - `pnpm lint` ensures code quality standards are met

### Common Issues and Solutions

**Issue**: ESLint complains about quote style
- **Cause**: GTS's quote rule conflicts with Prettier
- **Solution**: Already handled in `eslint.config.js` - GTS's quote rule is overridden to match Prettier

**Issue**: Formatting conflicts between tools
- **Cause**: ESLint and Prettier both trying to enforce formatting
- **Solution**: `eslint-config-prettier` (included in GTS) disables conflicting ESLint formatting rules

**Issue**: AI agents generating wrong quotes
- **Cause**: Tools have conflicting quote preferences
- **Solution**: Configuration ensures Prettier is the single source of truth for formatting

## ESLint Rules

The project uses ESLint rules to enforce architecture:

- Prevents components from importing services directly
- Prevents hooks from importing components
- Prevents common components from importing features

These rules are defined in `eslint.config.js` using GTS's flat config format.

## TypeScript Path Aliases

Path aliases are configured in `tsconfig.app.json` and `vite.config.ts`:

- `@/*` → `src/*`
- `@common/*` → `src/common/*`
- `@features/*` → `src/features/*`
- `@layouts/*` → `src/layouts/*`
- `@pages/*` → `src/pages/*`
- `@store/*` → `src/store/*`
- `@utils/*` → `src/utils/*`
- `@shared/*` → `src/shared/*`

## Data Provider Pattern

The app uses a Strategy pattern for data backends, allowing multiple backend implementations (Supabase, Airtable, Browser Storage) to be used interchangeably.

### Provider Structure

```
shared/services/
├── supabaseService.ts          # Supabase client initialization
├── airtableService.ts          # Airtable client initialization
└── dataProviders/
    ├── types.ts                # DataProvider interface
    ├── providerFactory.ts      # Provider selection logic
    ├── supabaseProvider.ts     # Supabase implementation
    ├── airtableProvider.ts     # Airtable implementation
    └── browserStorageProvider.ts # Browser storage implementation
```

### How It Works

1. **DataProvider Interface**: Defines the contract all providers must implement
2. **Provider Implementations**: Each backend (Supabase, Airtable, Browser Storage) implements the interface
3. **Provider Factory**: Selects the appropriate provider based on configuration
4. **Priority**: Supabase → Airtable → Browser Storage

### Usage in Services

```typescript
// services/todoService.ts
import { getDataProvider } from "@shared/services/dataProviders/providerFactory";

const provider = getDataProvider();

export const createTodo = async (input, userId) => {
  return provider.createTodo(input, userId);
};
```

### Adding a New Provider

1. Create provider class implementing `DataProvider` interface
2. Add configuration check function (e.g., `isNewBackendConfigured()`)
3. Update `providerFactory.ts` to include new provider in priority chain
4. Add environment variables if needed

## Best Practices

1. **Keep services pure**: Services should be pure functions, no React hooks
2. **Use hooks for state**: React hooks manage state and call services
3. **Components are UI-only**: Components render UI and call hooks
4. **Types in feature folders**: Keep types close to where they're used
5. **Shared code in shared/**: Only put truly shared code here
6. **Common components are reusable**: No business logic, just UI
7. **Use provider pattern for data backends**: Abstract backend implementations behind DataProvider interface

## Adding a New Feature

1. Create feature folder: `src/features/[feature-name]/`
2. Create subfolders: `components/`, `hooks/`, `services/`, `types/`
3. Start with types, then services, then hooks, then components
4. Create page in `src/pages/[FeatureName]Page.tsx`
5. Add route in `src/App.tsx`
6. Write tests alongside your code

## Example: Adding a "Notes" Feature

```
1. Create types: src/features/notes/types/notes.types.ts
2. Create service: src/features/notes/services/notesService.ts
3. Create hook: src/features/notes/hooks/useNotes.ts
4. Create components: src/features/notes/components/NoteList.tsx, NoteForm.tsx
5. Create page: src/pages/NotesPage.tsx
6. Add route: src/App.tsx
7. Write tests: src/features/notes/services/__tests__/notesService.test.ts
```

## Questions?

If you're unsure where to put code:
1. Is it reusable UI? → `common/`
2. Is it feature-specific? → `features/[feature]/`
3. Is it shared across features? → `shared/`
4. Is it a route? → `pages/`
5. Is it a layout? → `layouts/`


