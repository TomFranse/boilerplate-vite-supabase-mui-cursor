# check

## When the user requests a feature or functionality, follow these steps:

### 1. **Identify Required Information**
Categorize required info:

- **External:** Database schema, API keys, dependency docs, response formats
- **App context:** Architecture (`architecture/RULE.md`), tech stack, auth patterns, adjacent functionality, state management
- **Design intent:** When asking, **always offer multiple choices** (visual/UI, interactions, responsiveness)

For missing info: Find it OR ask the user.

---

### 2. **Identify Existing Functionality**
Locate similar functionality:
- Files, functions, and their purpose
- Reusable components/patterns (API design, state, error handling, loading states)
- Accessibility patterns already in use

---

### 3. **Refine into User Stories**
Extract user stories covering all relevant roles (may combine: "as an unauthorized/free/premium/admin user").

Include acceptance criteria:
- Happy path
- Error states and edge cases
- Loading and empty states
- Accessibility requirements

---

### 4. **Get User Confirmation**
Get explicit confirmation before drafting implementation plans.

---

### 5. **Draft Implementation Plans**
Draft concise plans (in chat), from exact match to streamlined alternatives. **Smart simplicity is the aim.**

**Core Principles:**
- Prioritize: efficiency, maintainability, consistency, reuse
- Minimize complexity; prefer existing patterns/dependencies
- Review current vs intended end state

**Inform user of opinionated choices** (dependency, architecture, UI placement) and mention viable alternatives. Warn if choices conflict.

**Each plan must include:**

#### A. Component/API Design
- Props interface (types, defaults)
- Follows existing patterns?
- Minimal API for common cases, flexible for advanced
- Composability with existing components

#### B. State & Data Flow
- State location (local/context/store)
- Async states (loading, error, empty, success)
- Side effects (API calls, subscriptions, timers)
- Data flow direction

#### C. UI/UX Considerations
- Layout and placement
- Responsive strategy (breakpoints)
- Interactive states (hover, active, disabled, loading, error)
- Empty and loading states

#### D. Accessibility Planning
- Keyboard interactions (Tab, Enter, Escape, arrows)
- ARIA attributes
- Focus management
- Semantic HTML

#### E. Technical Considerations
- Pseudo-code sketches
- New components: purpose, location (`file-placement/RULE.md`), reusability
- Performance (rendering, bundle size, lazy loading)
- Error scenarios and edge cases
- Dependencies (new needed? existing sufficient?)
- Integration points
- Impact on existing functionality
- **Architecture compliance:** Check `architecture/RULE.md` layer rules
- **File placement:** Validate against `projectStructure.config.js` (run `pnpm validate:structure`)
- **Complexity:** Will this exceed thresholds? (SSOT: `.eslintrc.json` lines 65-70)

#### F. Validation & Testing Plan
- How to validate correctness
- Key test cases (use Vitest - `pnpm test`)
- Manual testing steps

---

### 6. **Validate Architecture & Structure**
Before user approval, verify:
- [ ] File placements comply with `projectStructure.config.js`
- [ ] Layer boundaries respected (`architecture/RULE.md`)
- [ ] No circular dependencies
- [ ] Complexity thresholds won't be exceeded (SSOT: `.eslintrc.json` lines 65-70)

Run `pnpm validate:structure` and `pnpm arch:check` to verify.

---

### 7. **Get User Approval**
Wait for explicit approval of chosen implementation plan.

---

### 8. **Re-check Required Information**
Repeat step 1 for any missing information. **STAY HERE UNTIL ALL REQUIRED INFORMATION IS COLLECTED.**

---

### 9. **Document the Implementation Plan**
Create/update `/documentation/jobs/temp_job_[jobname]` (create folder if needed) with all required information, so implementation can proceed if chat history is cleared.

Include:
- User stories with acceptance criteria
- Chosen implementation plan
- Component/API design decisions
- State management approach
- File placements (validated)
- Accessibility requirements
- Test cases (Vitest)
- Files to create/modify

---

## Problem This Strategy Alleviates

Prevents: "Cursor agent adds features without analyzing existing code for efficient, thoughtful implementation. It doesn't seek simpler alternatives."

Ensures: Agent analyzes existing code to find efficient implementations and actively seeks simpler alternatives before building exactly what's requested.
