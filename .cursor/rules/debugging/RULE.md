---
description: "Debugging strategy, logging, issue analysis, and scientific method debugging"
alwaysApply: true
---

# Debugging and Logging

## Purpose

This rule defines debugging strategies, logging practices, and issue analysis patterns for effective problem-solving.

## Logs

- Do not remove debugging logs until the user confirms they are no longer needed.
- Logs must pass lint.
- For production builds, prefer:
  - A small logger or condition like:
    - `if (import.meta.env.VITE_DEBUG_API) { console.log(...) }`
  - So logs can be disabled in production.

## API Troubleshooting

- For request errors:
  - Log the request configuration before sending:
    - Method
    - URL
    - Query params
    - Headers (excluding auth)
    - Body (redacted when needed)
- For data processing issues:
  - Log the full raw response object, with tokens and obvious PII redacted.
- Ask the user to provide these logs during debugging.

## Filtering and Pagination

- If API responses always contain a round number of records (25, 50, 100, …) regardless of filters:
  - Suspect pagination limits first.
  - Only then dig into filter logic.

## Debugging Strategy

### Reductive Strategy (Bugs and New Features)

**When fixing errors, refactoring, or implementing new features, follow a reductive strategy:**

- Attempt to achieve the result by removing or simplifying existing code first.
- Prefer removing code over adding code.
- If the reductive fix does not work, explain your findings and then attempt another strategy.
- Prefer a sequence of small, targeted tests over one large, ambiguous test.

**This applies to:**
- Bug fixes
- Feature requests
- Refactoring
- Performance improvements

### Scope Reduction

- Reduce scope when something fails:
  - Start from the smallest testable piece (function, hook, component, API call).
  - Avoid changing multiple layers at once.

### Test Planning

- For every test you introduce (unit test, manual step, or log-based check), think ahead:
  - Define what you will conclude if the test fails.
  - Define what you will conclude if the test succeeds.
  - Define the next step for each outcome before you run the test.

### User Testing Instructions

**When instructing the user to test something:**

- **ALWAYS provide explicit next steps for BOTH success AND failure scenarios.**
- Format: "If SUCCESS → do X" and "If FAILURE → do Y"
- Never leave the user without a clear path forward for either outcome.
- Include what to check, what to report, or what to try next for each case.

## Scientific Method Debugging

**SSOT:** See `.cursor/commands/debug.md` for the complete Scientific Method Debugging process.

### Core Principle

Use **Scientific Method Debugging**. The user does **not** edit code. The user only:
- Performs actions in the app
- Filters console logs if needed
- Copies and pastes console logs
- Performs actions in external dashboards (e.g., Supabase)

**You must never claim the issue is fixed; only the user decides when the issue is resolved.**

### Expected Input

Accept any of:
- Error message + stack trace
- Console output
- Description of what the user did
- Mention of external systems involved

If information is missing, proceed with assumptions and state them.

### Component Nesting & Structure Analysis (React/UI Issues)

For UI/React issues, **always** analyze component nesting first, as nesting issues are often the root cause:

1. List all components/divs in which the problematic component is nested (full hierarchy).
2. List all properties being passed down through the component tree (prop drilling analysis).
3. Identify potential culprits:
   - CSS inheritance/overrides from parent components
   - Global styles affecting layout context (check body, html, #root for display: flex/grid that changes layout mode)
   - Overflow/stacking context issues (any element with overflow ≠ visible creates new stacking context)
   - Prop type mismatches or undefined props
   - Context providers affecting the component
   - Z-index/positioning conflicts from nesting
4. Form a hypothesis about which nesting level or prop is causing the issue.

This structural analysis informs the event chain reconstruction and helps identify if the issue is architectural rather than behavioral.

### Event Chain Reconstruction

For each issue:
1. Reconstruct the chain from user action → app behavior → API calls/side effects → failure point.
2. Present as a numbered list.
3. Identify the most suspicious link.

All diagnostic steps must map back to **specific links in this chain**.

### Hypotheses (Scientific Method)

For each issue propose 2–3 hypotheses:
- Each predicts **specific observable outcomes** the user can capture.
- Each includes a **falsification condition**.
- At least one involves an external configuration cause.
- Each hypothesis must map to a **specific step** in the event chain.

Hypotheses must be designed so that logs or observations can **decide between them**.

### Console Log Changes

- All hypotheses must be verifiable by the user by simply performing an action and sharing the (filtered) console log output.
- Console logs should include all possibly needed information for hypothesis falsification/verification.
- For API calls, raw API input and output can be needed. If so, log that to the console (take simple security measures to avoid exposing secrets).

### Unified Diagnostic Steps (Single Ordered List)

Provide **one integrated numbered list** of user actions.
These may include in-app interactions, devtools checks, network observations, or dashboard inspections.

Each step must:
- Correspond to a **specific location** in the event chain.
- Clearly state **what observation supports or refutes each hypothesis**.
- Aim to **cut the search space in half** with each action.
- Indicate precisely what the user should copy/paste back.

Avoid category labels; all steps belong to one unified list.

### Iterative Evidence Loop

When the user returns with logs or data:
1. Update the event chain using the new evidence.
2. Mark each hypothesis as **supported**, **refuted**, or **uncertain**, and briefly **explain why**.
3. Form a smaller, more precise hypothesis set.
4. Provide the next unified action list.

Repeat until only the user declares the issue resolved.

### External Configuration Awareness

Always include a configuration-based hypothesis when errors involve:
- Auth/permissions
- RLS policies
- API keys, tokens, or service URLs
- Environment variable mismatches
- Rate limits, quotas
- Dev vs prod differences

Provide specific checks and exact values the user should verify.

### Output Structure for Each Response

1. Quick Summary
2. Component Nesting Analysis (if UI/React issue)
3. Event Chain
4. Hypotheses (with predictions + falsification conditions)
5. Console log changes to verify/falsify all hypotheses
6. Unified Action Steps and code changes
7. What to Return
8. Next Narrowing Step

---

## Issue Analysis and Flow Reconstruction

### Flow Reconstruction

- For any reported issue, reconstruct the full flow:
  - User action
  - UI events and handlers
  - State updates and hooks
  - API calls and responses
  - State updates after responses
  - Final rendering
- Consider all relevant files, not just the one shown.

### Analysis and Hypotheses

- Describe in words:
  - The issue as observed.
  - The top three most likely causes.
  - One less obvious "out-of-the-box" cause.
- Propose:
  - The most likely root cause.
  - The first fix to implement, aligned with the debugging strategy above.

### After an Unsuccessful Fix

- Re-describe the flow with the new behavior.
- Explain:
  - What was changed.
  - What actually happened.
  - Why it did not solve the problem.
- Propose a revised solution and new, narrower tests.

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `workflow/RULE.md` - Reductive strategy for bug fixes and new features
- `testing/RULE.md` - Testing patterns and debugging test failures
- `architecture/RULE.md` - Component nesting and structural analysis

**Rules that reference this rule:**
- `workflow/RULE.md` - References debugging strategy
- `.cursor/commands/debug.md` - Complete Scientific Method Debugging process (SSOT for debugging commands)

