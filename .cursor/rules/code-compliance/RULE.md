---
description: "Enforces code compliance: double quotes, Prettier formatting, architecture rules, TypeScript best practices"
alwaysApply: true
---

# Code Compliance Rules

## Critical: Always Use Double Quotes

**ALWAYS use `"` not `'` for strings.**

```typescript
// ✅ CORRECT
import { Button } from "@common/Button";
const message = "Hello world";

// ❌ WRONG
import { Button } from '@common/Button';
const message = 'Hello world';
```

## Formatting (Prettier)

- Double quotes (`"`), 100 char width, 2 spaces, semicolons, LF line endings
- Arrow functions: `(x) => x` (always parentheses)

```typescript
export const Component = ({ title }: Props) => {
  return <Box sx={{ p: 2 }}>{title}</Box>;
};
```

## Architecture

**Layer hierarchy**: Pages → Components → Hooks → Services → Shared

**Rules:**
- Components cannot import services (use hooks)
- Hooks cannot import components
- Common components cannot import features
- Services cannot use React hooks

```typescript
// ✅ CORRECT
import { useTodos } from "../hooks/useTodos";
import { Button } from "@common/Button";

// ❌ WRONG
import * as todoService from "../services/todoService"; // Use hook instead
```

**Path aliases** (always use, never relative):
- `@common/*`, `@features/*`, `@shared/*`, `@pages/*`, `@layouts/*`, `@store/*`, `@utils/*`, `@components/*`

## TypeScript

- Interfaces for objects, types for unions
- Explicit return types for async functions
- No `any`, use `const`/`let` (never `var`)
- Use `===` (never `==`)
- Services: pure functions only (no hooks)

```typescript
export interface User {
  id: string;
  email: string;
}

export const fetchData = async (id: string): Promise<User | null> => {
  // Pure function, no hooks
};
```

## File Naming

- Components: `TodoItem.tsx` (PascalCase)
- Hooks: `useTodos.ts` (camelCase, `use` prefix)
- Services: `todoService.ts` (camelCase)
- Types: `todo.types.ts` (camelCase, `.types.ts` suffix)

**Remember: Double quotes (`"`) are CRITICAL.**
