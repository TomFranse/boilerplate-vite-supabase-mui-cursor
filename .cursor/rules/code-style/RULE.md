---
description: "Global code style and formatting standards for all projects"
alwaysApply: true
---

# Code Style Standards

## Purpose

This rule defines consistent code style, naming conventions, and formatting standards that apply across all projects.

## Quick Reference: Critical Rules

**CRITICAL**: These rules must be followed without exception:

- **Double quotes**: ALWAYS use `"` not `'` for strings
- **Path aliases**: Always use `@common/*`, `@features/*`, etc. - never relative imports
- **TypeScript strict mode**: REQUIRED (`strict: true`)
- **Arrow functions**: Always use parentheses: `(x) => x`
- **Equality**: Use `===` (never `==`)
- **Variables**: Use `const`/`let` (never `var`)
- **No `any`**: Explicit types required
- **Complexity**: Functions ≤ 10 cyclomatic, ≤ 15 cognitive, ≤ 100 lines, ≤ 4 nesting

See detailed sections below for complete guidance.

## Naming Conventions

### Variables and Functions
- Use camelCase for variables and functions
- Use descriptive names that indicate purpose
- Avoid abbreviations unless widely understood

### Constants
- Use UPPER_SNAKE_CASE for constants
- Group related constants together

### Types and Interfaces
- Use PascalCase for types and interfaces
- Prefix interfaces with `I` only if it adds clarity
- Use descriptive names that indicate structure
- **Interfaces for objects, types for unions**

### File Naming
- Components: `TodoItem.tsx` (PascalCase)
- Hooks: `useTodos.ts` (camelCase, `use` prefix)
- Services: `todoService.ts` (camelCase)
- Types: `todo.types.ts` (camelCase, `.types.ts` suffix)

## Formatting

### Quote Style

**CRITICAL: Always Use Double Quotes**

**ALWAYS use `"` not `'` for strings.**

```typescript
// ✅ CORRECT
import { Button } from "@common/Button";
const message = "Hello world";

// ❌ WRONG
import { Button } from '@common/Button';
const message = 'Hello world';
```

### Prettier Configuration

Standard formatting rules:
- Double quotes (`"`), 100 char width, 2 spaces, semicolons, LF line endings
- Arrow functions: `(x) => x` (always parentheses)

```typescript
export const Component = ({ title }: Props) => {
  return <Box sx={{ p: 2 }}>{title}</Box>;
};
```

### Indentation
- Use 2 spaces for indentation (not tabs)
- Maintain consistent indentation throughout files

### Line Length
- Maximum 100 characters per line
- Break long lines at logical points

### Spacing
- Use single spaces around operators
- No trailing whitespace
- One blank line between logical sections

### Line Endings
- **IMPORTANT**: Always use Linux/Unix line endings: LF (`\n`)
- Never use Windows line endings (CRLF) in code files
- Configure your editor and Git to use LF line endings

## Documentation

### Comments
- Write self-documenting code when possible
- Use comments to explain "why", not "what"
- Keep comments up to date with code changes

### JSDoc/TSDoc
- Document all exported functions and classes
- Include parameter descriptions and return types
- Add examples for complex functions

## Code Reuse

### Before Adding New Code
- **Prefer small, reusable components and hooks**
- Before adding new functionality, search for existing components/hooks/utilities that can be reused
- When explaining changes, note which existing pieces were checked for reuse
- Avoid duplicated UI or logic across the codebase

## Code Extraction Guidelines

### When Extracting Code to New Files (Hooks, Components, Utilities)

1. **Trace all usages**: For every piece of state, setter, or function being extracted:
   - Search the original file for ALL usages
   - Each usage must either:
     - Move into the new extraction, OR
     - Be exposed in the return interface/props
   - Pay special attention to: error clearing callbacks, reset functions, state setters used in event handlers

2. **Verify the consumer still compiles**: After extraction, check that every reference in the original file has a valid source—either from the new import or remaining local code.

### Import Guidelines

When adding external package imports:

1. **Verify the package is installed**: Check `package.json` dependencies
2. **Types may come from wrappers**: If using a library through a wrapper (e.g., TipTap through `mui-tiptap`), types often come from the wrapper, not the original package
3. **When in doubt, use inline types**: Define types locally or use `any` with eslint-disable rather than importing from potentially unavailable packages

## Code Organization

### Imports
- Group imports: external libraries first, then internal modules
- Sort imports alphabetically within groups
- Remove unused imports
- **Type imports**: Use `import type {...}` and place after regular imports in each group
- **Path aliases** (always use `@/` prefix, never relative — violations are **errors**):
  - `@/components/*`, `@/pages/*`, `@/hooks/*`, `@/services/*`, `@/utils/*`, `@/types/*`, `@/config/*`, `@/context/*`, `@/theme/*`, `@/routes/*`, `@/lib/*`, `@/ai-capabilities/*`

```typescript
// ✅ CORRECT
import { useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/common/Button";
import { userService } from "@/services/userService";

// ❌ WRONG
import { useTodos } from "../../shared/hooks/useTodos"; // Use path alias instead
import { Button } from "../../components/common/Button"; // Use path alias instead
import * as todoService from "../services/todoService"; // Components cannot import services directly
```

**Architecture Layer Rules** (see `architecture/RULE.md` for details):
- Components cannot import services (use hooks)
- Hooks cannot import components
- Common components cannot import features
- Services cannot use React hooks

### Exports
- Use named exports over default exports when possible
- Export types and interfaces explicitly

## Linting Standards

### Default Linting Tool: GTS (Google TypeScript Style)
- **Default**: Use `npx gts lint --fix` for TypeScript projects
- GTS provides consistent formatting and style enforcement
- Run linting before committing code
- Fix all linter errors (warnings are acceptable)

### Override Option
- Projects may specify alternative linting tools if needed
- Document the chosen linting tool in project documentation
- Ensure linting is automated and runs before commits
- Common alternatives: ESLint, Biome, etc.

### Complexity Standards

**SSOT:** `.eslintrc.json` lines 65-70 (enforced by ESLint during `pnpm lint`)

When writing code, adhere to these complexity limits to ensure maintainability:

| Metric | Limit | Guideline |
|--------|-------|-----------|
| Cyclomatic Complexity | ≤ 10 | Max branches/paths per function |
| Cognitive Complexity | ≤ 15 | Max mental effort to understand |
| Nesting Depth | ≤ 4 | Max `if`/`for`/`while` nesting levels |
| Function Length | ≤ 100 lines | Excluding blank lines and comments |
| Parameters | ≤ 5 | Use options object for more |
| Statements | ≤ 20 | Max statements per function |

**Reducing Complexity:**
- Extract helper functions for complex logic
- Use early returns to reduce nesting
- Replace nested conditionals with guard clauses
- Use options objects instead of many parameters
- Split large functions by responsibility

**Example - Before (too complex):**
```typescript
// ❌ Too many nested conditions
function processOrder(order, user, config) {
  if (order) {
    if (user) {
      if (config.enabled) {
        if (order.items.length > 0) {
          // deep nesting = hard to read
        }
      }
    }
  }
}
```

**Example - After (clean):**
```typescript
// ✅ Early returns, clear flow
function processOrder(order: Order, user: User, config: Config): void {
  if (!order || !user || !config.enabled) return;
  if (order.items.length === 0) return;
  
  // Process order - single level of logic
  processOrderItems(order.items);
}
```

**Reference:** See `.cursor/commands/complexity-reduce.md` for detailed refactoring workflow.

### TypeScript Configuration
- **REQUIRED**: All TypeScript projects must use strict mode
- Enable `strict: true` in `tsconfig.json`
- Strict mode enforces:
  - `strictNullChecks`
  - `strictFunctionTypes`
  - `strictBindCallApply`
  - `strictPropertyInitialization`
  - `noImplicitThis`
  - `alwaysStrict`

### TypeScript Best Practices
- **No `any`**: Explicit types required
- **Use `const`/`let`**: Never use `var`
- **Equality**: Use `===` (never `==`)
- **Explicit return types**: Required for async functions
- **Services**: Pure functions only (no React hooks)

```typescript
export interface User {
  id: string;
  email: string;
}

export const fetchData = async (id: string): Promise<User | null> => {
  // Pure function, no hooks
};
```

## Examples

### ✅ Good Example

```typescript
/**
 * Calculates the total price including tax.
 * @param price - The base price before tax
 * @param taxRate - The tax rate as a decimal (e.g., 0.20 for 20%)
 * @returns The total price including tax
 */
export function calculateTotalPrice(
  price: number,
  taxRate: number,
): number {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }
  return price * (1 + taxRate);
}
```

### ❌ Bad Example

```typescript
// Bad: unclear naming, no documentation, poor formatting
export function calc(p: number, t: number) {
return p*(1+t)
}
```

## TypeScript/React Standards (GTS Compliant)

When working with TypeScript and React, follow these GTS-compliant patterns:

### Component Structure
- Clear import order (external libraries first, then internal modules)
- JSDoc for all exported interfaces and types
- Explicit return types for all exported functions
- Use `readonly` for props that must not change

### State Management
- Explicit typing of state using generics: `useState<Type | null>(null)`
- Use `useCallback` for functions passed as dependencies
- Use `useEffect` for side-effects like data fetching
- Use `void` to indicate when promises are intentionally not awaited

### Error Handling
- Catch errors with `unknown` type and check the type
- Provide meaningful error messages
- Handle loading and error states explicitly

### Example: GTS-Compliant React Component

```typescript
// src/components/UserProfile.tsx
import React, {useState, useEffect, useCallback} from "react";
// Rule: Clear import order (external libraries first, then internal modules).

/**
 * Represents the structure of a user profile.
 * Rule: JSDoc for exported interfaces.
 */
export interface UserProfileData {
  readonly id: number; // Rule: Use 'readonly' for props that must not change.
  name: string;
  email: string;
}

/**
 * Properties for the UserProfile component.
 * Rule: JSDoc for exported types.
 */
export type UserProfileProps = {
  /** The ID of the user to fetch. */
  userId: number;
};

// A dummy API function to simulate data fetching.
const fetchUserData = async (userId: number): Promise<UserProfileData> => {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  if (!response.ok) {
    throw new Error("Network response was not ok.");
  }
  // Rule: Explicit return type for Promise return values.
  return response.json() as Promise<UserProfileData>;
};

/**
 * Fetches and displays a user profile.
 * Rule: JSDoc for main components, including @param and @returns.
 * @param props The properties for the component.
 * @returns A React element that displays the user profile.
 */
export function UserProfile({
  userId,
}: UserProfileProps): React.ReactElement | null {
  // Rule: Explicit typing of state, here derived via the generic <T | null>.
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rule: Use useCallback for functions passed as dependencies.
  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await fetchUserData(userId);
      setUser(userData);
    } catch (err: unknown) {
      // Rule: Catch errors with the 'unknown' type and check the type.
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Dependency array is explicit.
  
  // Rule: Use useEffect for side-effects like data fetching.
  useEffect(() => {
    void loadUser(); // 'void' to indicate we're not awaiting the promise.
  }, [loadUser]);
  
  if (isLoading) {
    return <div>Loading profile...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  // Rule: Return null or a fragment if there's no data to render.
  if (!user) {
    return null;
  }
  // Rule: Formatting is handled by Prettier (e.g., indentation, quotes).
  return (
    <div>
      <h2>User Profile</h2>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <button onClick={() => void loadUser()}>Refresh</button>
    </div>
  );
}
```

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `architecture/RULE.md` - May reference naming conventions for architectural patterns
- `testing/RULE.md` - May reference code style for test files
- `workflow/RULE.md` - May reference formatting standards in review process
- `.cursor/commands/complexity-reduce.md` - Detailed complexity reduction workflow

**Rules that reference this rule:**
- All other rules may reference code style standards

**SSOT:**
- Complexity thresholds: `.eslintrc.json` lines 65-70
