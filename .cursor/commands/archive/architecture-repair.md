# architecture-repair

## Purpose
Analyze the current repository structure against the intended architecture (from global rules and/or architecture.md) and identify top-priority refactoring opportunities, accounting for import dependencies and cascading effects.

## Workflow

### 1. **Gather Architecture Standards**
   - **Check global rules** (.cursor/rules/*.mdc, .cursorrules, or similar) for architectural standards
   - **Check for architecture.md** in documentation/ or root directory
   - **Extract intended patterns:**
     - Folder structure conventions (e.g., `src/components/`, `src/utils/`, `functions/`)
     - File naming conventions (e.g., PascalCase for components, camelCase for utilities)
     - Separation of concerns (e.g., business logic vs UI, shared utilities location)
     - Domain boundaries (e.g., feature-based vs layer-based organization)
     - Import path conventions (e.g., absolute imports from `src/`, relative imports)
   - **If no explicit architecture found:** Infer from existing codebase patterns and common best practices for the tech stack

### 2. **Map Current Reality**
   - **Scan repository structure:**
     - List all directories and their contents
     - Identify file types and their locations
     - Map import relationships (which files import from which)
   - **Build dependency graph:**
     - For each file, identify all imports (both internal and external)
     - Track circular dependencies
     - Identify files with many dependents (high coupling)
     - Identify orphaned or misplaced files

### 3. **Identify Architectural Violations**
   For each file/directory, check against intended architecture:
   - **Location violations:** Files in wrong directories (e.g., utils in components folder)
   - **Naming violations:** Files not following naming conventions
   - **Coupling violations:** Files importing from wrong layers/domains
   - **Missing abstractions:** Duplicated code that should be shared utilities
   - **Misplaced concerns:** Business logic in UI components, UI logic in utilities
   - **Import path violations:** Using relative paths when absolute paths are standard (or vice versa)

### 4. **Calculate Refactoring Impact**
   For each violation, assess:
   - **Dependency count:** How many files import this file?
   - **Cascading changes:** If moved, how many import statements need updating?
   - **Risk level:** 
     - Low: Few dependents, isolated functionality
     - Medium: Moderate dependents, some cross-cutting concerns
     - High: Many dependents, core functionality, or circular dependencies
   - **Move complexity:**
     - Simple: Just file move, imports auto-update (manual move in Cursor)
     - Medium: File move + import updates needed (agent move via commands)
     - Complex: File move + import updates + potential breaking changes (type exports, barrel files, etc.)

### 5. **Prioritize Refactoring Opportunities**
   Rank violations by:
   - **Impact score:** (Dependency count × Risk level) - (Move complexity)
   - **Quick wins:** Low complexity, high architectural benefit
   - **Foundation fixes:** Core structural issues that block other improvements
   - **Group related moves:** Files that should move together to minimize import updates

### 6. **Generate Actionable Recommendations**
   For each top priority (top 5-10), provide:
   - **Current location:** Full path to file/directory
   - **Intended location:** Where it should be according to architecture
   - **Reason:** Why this violates architecture standards
   - **Impact summary:**
     - Number of files that import this
     - Estimated import statements to update
     - Risk level (Low/Medium/High)
   - **Recommended approach:**
     - **Option A - Manual Move (Preferred if Cursor auto-updates imports):**
       - "Move manually in Cursor IDE (drag/drop or right-click → Move)"
       - "Cursor may auto-update imports; verify after move"
       - "Run type-check and lint after move"
     - **Option B - Agent Move (If manual move doesn't auto-update):**
       - "Agent will move file and update all imports"
       - "Requires: [list of files that need import updates]"
       - "Estimated changes: [number] import statements across [number] files"
   - **Dependencies to check:** List files that import this, so user can verify after move

### 7. **Output Format**
   Present findings as:

   ```
   # Architecture Repair Analysis

   ## Architecture Standards Found
   [Summary of standards from rules/architecture.md]

   ## Top Priority Refactoring Opportunities

   ### 1. [Priority Name] - [Risk Level]
   **Current:** `path/to/current/file.ts`
   **Should be:** `path/to/intended/file.ts`
   **Reason:** [Why this violates architecture]
   **Impact:** 
   - [X] files import this
   - [Y] import statements need updating
   - Risk: [Low/Medium/High]
   
   **Recommended Approach:** [Option A or B with details]
   **Files to verify after move:** [List of importing files]

   ### 2. [Next Priority]
   ...
   ```

### 8. **Considerations for Move Execution**

   **When user requests to execute a move:**
   - **First, verify:** Ask user to confirm they want to proceed with the move
   - **Check for circular dependencies:** If moving would create cycles, warn user
   - **Create backup plan:** Document current state before changes
   - **For manual moves (Option A):**
     - Provide exact instructions: "Move file X to location Y"
     - After user moves, verify imports are updated
     - If imports not auto-updated, switch to Option B
   - **For agent moves (Option B):**
     - Use file system operations to move file
     - Search for all imports of the moved file
     - Update import paths in all dependent files
     - Handle:
       - Relative imports (calculate new relative path)
       - Absolute imports (update path alias if needed)
       - Barrel file exports (update index.ts if applicable)
       - Type-only imports (preserve `import type` syntax)
   - **After move:**
     - Run type-check to verify no broken imports
     - Run linter to catch any issues
     - Verify no circular dependencies introduced

### 9. **Batch Moves**
   If multiple files should move together:
   - **Group by domain/feature:** Move all related files in one operation
   - **Order matters:** Move dependencies before dependents
   - **Update all imports:** After batch move, update all affected imports
   - **Verify:** Type-check and lint after batch

### 10. **Documentation Update**
   After significant architectural changes:
   - Update architecture.md if it exists
   - Document the refactoring in a changelog or migration notes
   - Update any path references in documentation

## Important Notes

- **Cursor IDE behavior:** Manual folder/file moves in Cursor may auto-update imports, but this is not guaranteed. Always verify imports after manual moves.
- **Agent moves:** When agent moves files via commands, imports are NOT auto-updated. Agent must explicitly update all import statements.
- **Type safety:** Always run type-check after moves to catch any missed imports or type errors.
- **Testing:** After architectural changes, recommend user runs tests if available.
- **Incremental approach:** Suggest fixing highest priority items first, then re-running analysis.

## Example Output Structure

```
# Architecture Repair Analysis

## Architecture Standards Found
- Components in `src/components/`
- Utilities in `src/utils/`
- Business logic separated from UI
- Absolute imports from `src/` root

## Top Priority Refactoring Opportunities

### 1. Misplaced Utility Function - Medium Risk
**Current:** `src/components/helpers/formatDate.ts`
**Should be:** `src/utils/dateUtils.ts`
**Reason:** Utility functions should not be in components folder
**Impact:** 
- 12 files import this
- 12 import statements need updating
- Risk: Medium

**Recommended Approach:** Option B - Agent Move
- Agent will move file and update all 12 import statements
- Files affected: [list]

### 2. Business Logic in Component - High Risk
**Current:** `src/components/UserProfile.tsx` (contains API calls)
**Should be:** Extract to `src/hooks/useUserProfile.ts` + `src/services/userService.ts`
**Reason:** Business logic should be separated from UI components
**Impact:**
- 3 files import UserProfile component
- Requires refactoring, not just move
- Risk: High

**Recommended Approach:** Option C - Refactor First
- Extract business logic to hook/service
- Then move if needed
- More complex, but addresses root cause
```

