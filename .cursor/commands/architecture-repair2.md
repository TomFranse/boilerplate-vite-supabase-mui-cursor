# architecture-repair

## Purpose
Complement automated architecture enforcement tools by identifying semantic violations, code organization issues, and providing refactoring guidance that automated tools cannot detect. This command focuses on architectural intent and refactoring execution, not duplicate checks already covered by scripts.

## Workflow

### Phase 1: Run Automated Architecture Checks (Baseline)

**First, run existing architecture validation tools to establish baseline:**

1. **Project Structure Validation:**
   ```bash
   pnpm validate:structure
   ```
   - Checks: Folder/file location violations, naming conventions, whitelist compliance
   - **Output:** List of files in wrong locations (already caught by script)
   - **Action:** Fix these first before proceeding

2. **ESLint Architecture Rules:**
   ```bash
   pnpm lint:arch
   ```
   - Checks: Layer boundary violations, relative import violations (`../`), circular dependencies
   - **Output:** Layer violations, import path issues (already caught by ESLint)
   - **Action:** Fix these before proceeding

3. **Dependency-Cruiser Analysis:**
   ```bash
   pnpm arch:check
   ```
   - Checks: Circular dependencies (deep), layer violations, orphaned modules
   - **Output:** Dependency graph violations (already caught by dependency-cruiser)
   - **Action:** Review and fix critical issues

**Note:** This command assumes you've already fixed violations caught by the above tools. It focuses on issues they cannot detect.

### Phase 2: Semantic Architecture Analysis (What Tools Miss)

After automated checks pass, analyze semantic violations that require human judgment:

#### 2.1. **Misplaced Concerns (Code Organization)**
   - **Business logic in UI components:** Components containing API calls, complex calculations, or data transformations
   - **UI logic in utilities:** Utils containing React-specific code or DOM manipulation
   - **Service logic in hooks:** Hooks containing business rules instead of orchestration
   - **Detection method:** Read file contents, analyze imports and function complexity
   - **Not covered by tools:** Tools check import paths, not semantic content

#### 2.2. **Missing Abstractions (Code Duplication)**
   - **Duplicated logic:** Same code patterns repeated across multiple files
   - **Should be shared utilities:** Common functions that should live in `shared/utils/`
   - **Should be services:** API calls or data access duplicated across features
   - **Detection method:** Pattern matching, code similarity analysis
   - **Not covered by tools:** Tools don't detect semantic duplication

#### 2.3. **Feature Boundary Violations**
   - **Cross-feature dependencies:** Features importing from other features' internal modules
   - **Shared code in wrong location:** Code used by multiple features but placed in single feature
   - **Detection method:** Analyze import paths between features, identify shared dependencies
   - **Partially covered:** ESLint boundaries checks some, but not all cross-feature issues

#### 2.4. **Architectural Intent Violations**
   - **Files in technically valid but semantically wrong locations:** 
     - Example: Utility function in `components/helpers/` instead of `shared/utils/`
     - Example: Feature-specific hook in `shared/hooks/` instead of `features/[feature]/hooks/`
   - **Detection method:** Analyze file purpose vs location, check import patterns
   - **Not covered by tools:** Tools validate structure, not semantic correctness

### Phase 3: Refactoring Impact Analysis

For each semantic violation identified, calculate refactoring impact:

#### 3.1. **Dependency Analysis**
   - **Count dependents:** How many files import this file?
   - **Identify import locations:** List all files that would need import updates
   - **Check for circular dependencies:** Would move create cycles? (complement dependency-cruiser)
   - **Tool:** Use grep/codebase search to find all imports

#### 3.2. **Move Complexity Assessment**
   - **Simple:** File move only, no import updates needed (rare)
   - **Medium:** File move + import path updates (most common)
   - **Complex:** File move + import updates + refactoring (extract logic, split files)
   - **Risk level:**
     - Low: Few dependents, isolated functionality
     - Medium: Moderate dependents, some cross-cutting concerns
     - High: Many dependents, core functionality, or requires refactoring

#### 3.3. **Path Alias Compliance**
   - **Verify:** All imports use `@/` prefix (enforced by ESLint, but verify during move)
   - **Update strategy:** Convert relative imports to path aliases during move
   - **Tool:** ESLint already enforces, but verify during refactoring

### Phase 4: Prioritization and Recommendations

Rank violations by:
- **Impact score:** (Dependency count × Risk level) - (Move complexity)
- **Quick wins:** Low complexity, high architectural benefit
- **Foundation fixes:** Core structural issues that block other improvements
- **Group related moves:** Files that should move together to minimize import updates

### Phase 5: Generate Actionable Recommendations

For each top priority violation (top 5-10), provide:

- **Current location:** Full path to file/directory
- **Intended location:** Where it should be according to architecture (must exist in `projectStructure.config.js` whitelist)
- **Reason:** Why this violates architectural intent (semantic violation)
- **Impact summary:**
  - Number of files that import this
  - Estimated import statements to update
  - Risk level (Low/Medium/High)
  - Move complexity (Simple/Medium/Complex)
- **Recommended approach:**
  - **Option A - Manual Move (Preferred if Cursor auto-updates imports):**
    - "Move manually in Cursor IDE (drag/drop or right-click → Move)"
    - "Cursor may auto-update imports; verify after move"
    - "Run `pnpm validate:structure && pnpm lint:arch` after move"
  - **Option B - Agent Move (If manual move doesn't auto-update):**
    - "Agent will move file and update all imports"
    - "Requires: [list of files that need import updates]"
    - "Estimated changes: [number] import statements across [number] files"
    - "All imports will use path aliases (`@/` prefix)"
- **Dependencies to check:** List files that import this, so user can verify after move

### Phase 6: Output Format

Present findings as:

```
# Architecture Repair Analysis

## Automated Checks Status
✅ Project structure validation: [PASS/FAIL - X violations]
✅ ESLint architecture rules: [PASS/FAIL - X violations]
✅ Dependency-cruiser analysis: [PASS/FAIL - X violations]

**Note:** Fix automated violations first. Below are semantic violations that require human judgment.

## Semantic Architecture Violations

### 1. [Violation Name] - [Risk Level]
**Current:** `path/to/current/file.ts`
**Should be:** `path/to/intended/file.ts` (validated against projectStructure.config.js whitelist)
**Reason:** [Why this violates architectural intent - semantic violation]
**Type:** [Misplaced Concerns / Missing Abstraction / Feature Boundary / Intent Violation]

**Impact:** 
- [X] files import this
- [Y] import statements need updating
- Risk: [Low/Medium/High]
- Complexity: [Simple/Medium/Complex]

**Recommended Approach:** [Option A or B with details]
**Files to verify after move:** [List of importing files]

### 2. [Next Priority]
...
```

### Phase 7: Move Execution Workflow

**When user requests to execute a move:**

1. **Pre-flight checks:**
   - Verify intended location exists in `projectStructure.config.js` whitelist
   - Check for circular dependencies (would move create cycles?)
   - Confirm all imports will use path aliases (`@/` prefix)
   - Ask user to confirm they want to proceed

2. **For manual moves (Option A):**
   - Provide exact instructions: "Move file X to location Y"
   - After user moves, verify:
     - Run `pnpm validate:structure` (structure compliance)
     - Run `pnpm lint:arch` (layer boundaries, path aliases)
     - Run `pnpm arch:check` (circular dependencies)
   - If imports not auto-updated, switch to Option B

3. **For agent moves (Option B):**
   - Use file system operations to move file
   - Search for all imports of the moved file (grep/codebase search)
   - Update import paths in all dependent files:
     - Convert to path aliases (`@/` prefix) - never relative parent imports
     - Handle barrel file exports (update `index.ts` if applicable)
     - Preserve `import type` syntax for type-only imports
   - Verify:
     - Run `pnpm validate:structure` (structure compliance)
     - Run `pnpm lint:arch` (layer boundaries, path aliases)
     - Run `pnpm arch:check` (circular dependencies)
     - Run type-check (`tsc --noEmit` or equivalent)

### Phase 8: Batch Moves

If multiple files should move together:
- **Group by domain/feature:** Move all related files in one operation
- **Order matters:** Move dependencies before dependents
- **Update all imports:** After batch move, update all affected imports
- **Verify:** Run all validation commands after batch

### Phase 9: Documentation Update

After significant architectural changes:
- Update `architecture.md` if it exists
- Document the refactoring in `CHANGELOG.md`
- Update any path references in documentation

## Important Notes

- **Complementary, not duplicate:** This command focuses on semantic violations that automated tools cannot detect
- **Run tools first:** Always run `pnpm validate:structure`, `pnpm lint:arch`, and `pnpm arch:check` before using this command
- **Path aliases required:** All imports must use `@/` prefix (enforced by ESLint, but verify during moves)
- **Whitelist compliance:** All intended locations must exist in `projectStructure.config.js` - never suggest modifying whitelist to accommodate violations
- **Baseline respect:** Existing violations in `.dependency-cruiser-baseline.json` are ignored - focus on new violations
- **Architecture rules immutable:** Violations mean code is wrong, not that rules are wrong
- **Cursor IDE behavior:** Manual folder/file moves in Cursor may auto-update imports, but this is not guaranteed. Always verify imports after manual moves.
- **Agent moves:** When agent moves files via commands, imports are NOT auto-updated. Agent must explicitly update all import statements.
- **Type safety:** Always run type-check after moves to catch any missed imports or type errors.
- **Testing:** After architectural changes, recommend user runs tests if available.
- **Incremental approach:** Suggest fixing highest priority items first, then re-running analysis.

## What This Command Does NOT Cover (Already Automated)

- ✅ **Folder/file location violations** → Covered by `project-structure-validator.js`
- ✅ **Layer boundary violations** → Covered by ESLint `boundaries/element-types`
- ✅ **Relative import violations (`../`)** → Covered by ESLint `no-restricted-imports`
- ✅ **Circular dependencies** → Covered by ESLint `import/no-cycle` and dependency-cruiser
- ✅ **Orphaned modules** → Covered by dependency-cruiser
- ✅ **File naming conventions** → Covered by `project-structure-validator.js`

## What This Command DOES Cover (Semantic Analysis)

- 🔍 **Misplaced concerns** (business logic in components, UI in utils)
- 🔍 **Missing abstractions** (code duplication that should be shared)
- 🔍 **Feature boundary violations** (cross-feature dependencies)
- 🔍 **Architectural intent violations** (semantically wrong but technically valid locations)
- 🔍 **Refactoring impact analysis** (dependency counting, move complexity)
- 🔍 **Prioritization and recommendations** (quick wins, foundation fixes)
- 🔍 **Move execution guidance** (step-by-step refactoring workflow)

## Example Output Structure

```
# Architecture Repair Analysis

## Automated Checks Status
✅ Project structure validation: PASS
✅ ESLint architecture rules: PASS  
✅ Dependency-cruiser analysis: PASS (2 warnings in baseline)

**Note:** Automated checks passed. Below are semantic violations requiring human judgment.

## Semantic Architecture Violations

### 1. Business Logic in Component - High Risk
**Current:** `src/components/UserProfile.tsx` (contains API calls and data transformations)
**Should be:** Extract to `src/features/users/hooks/useUserProfile.ts` + `src/features/users/services/userService.ts`
**Reason:** Component contains business logic (API calls, data transformations) that should be in hooks/services
**Type:** Misplaced Concerns

**Impact:** 
- 3 files import UserProfile component
- Requires refactoring, not just move (extract logic first)
- Risk: High
- Complexity: Complex

**Recommended Approach:** Option C - Refactor First
- Extract business logic to hook/service
- Then move if needed
- More complex, but addresses root cause

### 2. Duplicated Utility Function - Medium Risk
**Current:** `src/components/helpers/formatDate.ts` (also exists in `src/features/billing/utils/formatDate.ts`)
**Should be:** `src/shared/utils/dateUtils.ts` (consolidate both)
**Reason:** Same utility function duplicated in multiple locations - should be shared utility
**Type:** Missing Abstraction

**Impact:** 
- 12 files import from component helper version
- 8 files import from feature version
- Risk: Medium
- Complexity: Medium (consolidate + update imports)

**Recommended Approach:** Option B - Agent Move
- Consolidate both files into `src/shared/utils/dateUtils.ts`
- Update all 20 import statements
- All imports will use `@/utils/dateUtils` path alias
- Files affected: [list]
```
