# complexity-reduce

## Purpose
Identify and prioritize the most problematic complexity hotspots in the repository, then execute complete refactorings to reduce complexity systematically. Agent will analyze, recommend, and execute full refactorings (not partial implementations).

## Workflow

### 1. **Ensure ESLint Complexity Rules Are Configured**
   - **Check ESLint configuration** (`.eslintrc.*`, `eslint.config.js`, or `package.json`) for complexity rules:
     - `complexity` (cyclomatic complexity, threshold: 10)
     - `max-depth` (nesting depth, threshold: 4)
     - `max-lines-per-function` (function length, threshold: 50)
     - `max-statements` (statement count, threshold: 10)
     - `max-params` (parameter count, threshold: 3)
     - `sonarjs/cognitive-complexity` (cognitive complexity, threshold: 15)
   - **If complexity rules are missing:**
     - **Agent must add them** to ESLint config (start with "warn" level for existing code)
     - Install `eslint-plugin-sonarjs` if not present: `npm install eslint-plugin-sonarjs --save-dev`
     - Add plugin and rules to config
     - Keep thresholds balanced and consistent across all rules
   - **If complexity rules exist but thresholds are too lenient:**
     - Update thresholds to recommended values
     - Document the change

### 2. **Run Complexity Analysis**
   - **Execute ESLint with complexity rules:**
     - Run `npm run lint` or equivalent
     - Capture all complexity violations
     - Group by file and severity
   - **Calculate additional metrics manually if needed:**
     - File size (lines of code)
     - Import dependencies (fan-in/fan-out)
     - Number of exports per file
     - Depth of file in directory structure
   - **Identify patterns:**
     - Files with multiple complexity violations
     - Functions/methods exceeding thresholds
     - Deeply nested code blocks
     - Long parameter lists
     - Circular dependencies

### 3. **Identify Hotspots (High Complexity + High Churn)**
   - **Analyze git history** (git history is available):
     - Files changed frequently in recent commits (e.g., last 30 days)
     - Files modified by multiple contributors
     - Files with many merge conflicts
     - Calculate churn score: (number of commits × number of contributors) / time period
   - **Combine metrics:**
     - **High Complexity + High Churn** = Priority Hotspot (refactor first)
     - **High Complexity + Low Churn** = Still refactor, but lower priority
     - **Low Complexity + High Churn** = May indicate architectural issues (consider in architecture-repair)
   - **Prioritize both quick wins and high-impact areas** - balance based on situation

### 4. **Categorize Complexity Types**
   For each problematic file/function, identify the primary complexity type:
   - **Structural Complexity:**
     - High cyclomatic complexity (many branches)
     - Deep nesting (pyramid of doom)
     - Long functions/methods
   - **Coupling Complexity:**
     - High fan-in (many files depend on this)
     - High fan-out (depends on many files)
     - Circular dependencies
   - **Interface Complexity:**
     - Too many parameters
     - God objects (classes with too many responsibilities)
     - Fat interfaces
   - **Cognitive Complexity:**
     - Hard-to-read code patterns
     - Clever one-liners
     - Inconsistent patterns

### 5. **Prioritize Refactoring Opportunities**
   Rank by **Complexity Impact Score:**
   ```
   Score = (Complexity Violations × Weight) + (Dependency Count × Weight) + (Churn × Weight)
   ```
   - **Priority 1 (Critical):** High complexity + high churn + many dependents
   - **Priority 2 (High):** High complexity + moderate churn
   - **Priority 3 (Medium):** Moderate complexity + architectural violations
   - **Priority 4 (Low):** Low complexity but violates best practices

### 6. **Recommend Specific Refactoring Techniques**
   For each hotspot, suggest targeted refactoring methods:

   **For Structural Complexity:**
   - **Extract Method:** Break long functions into smaller, well-named methods
   - **Extract Class:** Move related methods into a dedicated class
   - **Replace Conditional with Polymorphism:** Use interfaces/inheritance instead of switch/if-else chains
   - **Simplify Conditional Expressions:**
     - Use Guard Clauses (early returns)
     - Apply De Morgan's Laws
     - Extract complex conditions to named boolean functions
   - **Replace Nested Conditionals with Guard Clauses:** Reduce nesting depth

   **For Coupling Complexity:**
   - **Extract Interface:** Create focused interfaces instead of fat ones
   - **Move Method:** Relocate methods to classes that use them
   - **Introduce Parameter Object:** Replace long parameter lists with objects
   - **Dependency Injection:** Reduce direct dependencies
   - **Break Circular Dependencies:** Introduce abstraction layer or invert dependency

   **For Interface Complexity:**
   - **Extract Class:** Split God objects into focused classes
   - **Interface Segregation:** Create smaller, specific interfaces
   - **Replace Parameter with Object:** Group related parameters
   - **Introduce Builder Pattern:** For objects with many optional parameters

   **For Cognitive Complexity:**
   - **Rename Variables/Methods:** Use descriptive names
   - **Extract Constants:** Replace magic numbers/strings
   - **Add Comments:** Explain "why" not "what" (temporary, until code is clearer)
   - **Standardize Patterns:** Use consistent approaches across codebase

### 7. **Create Actionable Refactoring Plan**
   For each top priority (top 5-10), provide a **complete refactoring plan** that agent can execute fully:

   ```
   ### [Priority] [File/Function Name] - [Complexity Type]
   
   **Location:** `path/to/file.ts:line-start:line-end`
   **Current Metrics:**
   - Cyclomatic Complexity: [X] (threshold: 10)
   - Cognitive Complexity: [Y] (threshold: 15)
   - Nesting Depth: [Z] (threshold: 4)
   - Function Length: [W] lines (threshold: 50)
   - Parameters: [N] (threshold: 3)
   - Dependencies: [M] files import this
   - Churn: [commits/contributors in last 30 days]
   
   **Problem:** [Specific description of complexity issue]
   
   **Complete Refactoring Plan (Agent will execute fully):**
   1. [Specific technique with exact lines, e.g., "Extract method `calculateTotal()` from lines 45-78"]
   2. [Next technique, e.g., "Replace nested if-else with guard clauses at lines 80-95"]
   3. [Additional steps...]
   - **If complexity reduction requires removing functionality:** Consider design changes that eliminate the need for complex logic. Removing features is acceptable if it significantly reduces complexity.
   
   **Expected Outcome:**
   - Complexity reduced to: [target metrics - must meet thresholds]
   - Functions created: [list of new functions with exact names]
   - Files created/modified: [complete list]
   - Dependencies affected: [list if any]
   - Behavior: [unchanged OR documented changes if functionality removed]
   
   **Risk Level:** [Low/Medium/High] ⚠️
   - Low: Isolated function, few dependents, clear extraction
   - Medium: Some dependencies, requires careful testing
   - High: Core functionality, many dependents, **but proceed anyway** - flag for user awareness
   
   **Testing Strategy (Mandatory):**
   - [ ] Write unit tests for current behavior BEFORE refactoring (tests don't exist yet)
   - [ ] Create test file: `[test-file-path]`
   - [ ] Test all edge cases and branches
   - [ ] Execute complete refactoring (all steps, not incremental)
   - [ ] Verify all tests still pass after refactor
   - [ ] Run complexity analysis again to confirm reduction
   - [ ] Run type-check and linter
   ```

### 8. **Execute Complete Refactoring (Agent Workflow)**
   When user approves refactoring plan, agent executes **complete refactoring** (not partial):

   **Before Starting:**
   - **Write tests first** (tests don't exist yet - this is mandatory)
   - Create test file(s) covering current behavior
   - Document current behavior and edge cases
   - Create backup branch (optional, but recommended for high-risk refactorings)

   **Complete Refactoring Execution:**
   1. **Execute all refactoring steps** in the plan (full refactoring, not incremental)
   2. **Create new files** if extracting to separate modules
   3. **Update all imports** across the codebase (if files moved/extracted)
   4. **Update barrel exports** (index.ts files) if needed
   5. **Handle TypeScript types** - ensure all types are properly exported/imported
   6. **Run linter:** Fix any new linting issues introduced
   7. **Run type-check:** Ensure TypeScript/types are still valid
   8. **Run tests:** Verify all tests pass (both existing and newly written)
   9. **Re-run complexity analysis:** Verify metrics meet thresholds
   10. **Verify no regressions:** Check that behavior is unchanged (or document intentional changes)

   **After Refactoring:**
   - Re-run ESLint complexity analysis
   - Verify all metrics meet thresholds
   - Update documentation if needed
   - Commit with clear message: "refactor: reduce complexity in [file] - [summary]"
   - If high-risk refactoring: Flag for user review before merging

### 9. **Aggressive Complexity Reduction**
   **Philosophy:** Don't be afraid to take risks. Even stripping functionality may be acceptable if a slight design change creates significant complexity reduction.

   **When Complexity Reduction Requires Design Changes:**
   - **Consider removing features** if they add disproportionate complexity
   - **Simplify interfaces** even if it means breaking changes (document them)
   - **Question the necessity** of complex logic - can it be eliminated entirely?
   - **Propose alternative designs** that achieve the same goal with less complexity

   **For Large Repositories:**
   - Focus on **hotspots first** (high complexity + high churn)
   - But also address **quick wins** when encountered
   - Balance based on situation - don't rigidly prioritize one over the other
   - Execute **complete refactorings** - don't leave partial implementations

### 10. **Output Format (Structured for Agent Execution)**
   Present findings in structured format that agent can execute:

   ```
   # Complexity Reduction Analysis

   ## ESLint Configuration Status
   - Complexity rules: [Enabled/Added/Updated]
   - Thresholds: [list all thresholds]
   - Plugin status: [eslint-plugin-sonarjs installed/installed]

   ## Current State
   - Total complexity violations: [X]
   - Files with violations: [Y]
   - Average complexity per violation: [Z]
   - Language focus: TypeScript (primary), [other languages found]

   ## Top Priority Hotspots

   ### 1. [File Name] - [Priority Level]
   [Complete refactoring plan as described in section 7]

   ### 2. [Next Priority]
   ...

   ## Refactoring Techniques to Apply
   [Summary of techniques that will be used across all hotspots]

   ## Execution Readiness
   - [ ] ESLint complexity rules configured
   - [ ] Analysis complete
   - [ ] Refactoring plans created
   - [ ] Ready for user approval to execute

   ## Next Steps (After User Approval)
   1. Write tests for first hotspot
   2. Execute complete refactoring for first hotspot
   3. Verify metrics improvement
   4. Proceed to next hotspot
   ```

### 11. **Complexity Metrics Reference**
   Include threshold recommendations:

   | Metric | Threshold | Tool |
   |--------|-----------|------|
   | Cyclomatic Complexity | ≤ 10 per function | ESLint `complexity` |
   | Cognitive Complexity | ≤ 15 per function | `eslint-plugin-sonarjs` |
   | Nesting Depth | ≤ 4 levels | ESLint `max-depth` |
   | Function Length | ≤ 50 lines | ESLint `max-lines-per-function` |
   | Parameters | ≤ 3 per function | ESLint `max-params` |
   | Statements | ≤ 10 per function | ESLint `max-statements` |

### 12. **Code Smell Detection**
   Identify common code smells that indicate complexity:
   - **Long Method:** Function exceeds line/statement thresholds
   - **Large Class:** Class with too many methods/fields
   - **Long Parameter List:** Function with many parameters
   - **Data Clumps:** Groups of data always passed together
   - **Primitive Obsession:** Using primitives instead of objects
   - **Feature Envy:** Method uses more features of another class than its own
   - **God Object:** Class that knows/does too much
   - **Duplicate Code:** Same logic in multiple places

## Important Notes

- **Test Coverage:** Tests don't exist yet - agent MUST write tests before refactoring. This is mandatory.
- **Complete Refactorings:** Execute full refactorings, not partial implementations. Don't leave work half-done.
- **Behavior Preservation:** Refactoring should not change external behavior—only internal structure. Exception: If removing functionality significantly reduces complexity, document the change.
- **Risk Tolerance:** Flag high-risk refactorings but proceed anyway. Don't be afraid to take risks.
- **Design Changes:** Consider removing features or simplifying designs if they create disproportionate complexity. Even stripping functionality is acceptable if it creates big complexity improvements.
- **ESLint Rules:** Agent must ensure ESLint complexity rules are configured with balanced thresholds. Add them if missing.
- **Language Focus:** Primary focus on TypeScript, but handle other languages found in the repo appropriately.
- **Git History:** Use git history for churn analysis - it's available and should be used.
- **Workflow:** Analyze → Recommend → User Approves → Agent Executes Complete Refactoring → Verify

## Example Output Structure

```
# Complexity Reduction Analysis

## ESLint Configuration Status
- Complexity rules: ✅ Added to eslint.config.js
- Thresholds: complexity: 10, max-depth: 4, max-lines-per-function: 50, max-statements: 10, max-params: 3, cognitive-complexity: 15
- Plugin status: ✅ eslint-plugin-sonarjs installed

## Current State
- Total complexity violations: 47
- Files with violations: 23
- Average cyclomatic complexity: 18.3
- Language focus: TypeScript (primary), Python (found in scripts/)

## Top Priority Hotspots

### 1. UserProfile.tsx - calculateTotalPrice() - Critical Priority
**Location:** `src/components/UserProfile.tsx:145:198`
**Current Metrics:**
- Cyclomatic Complexity: 24 (threshold: 10) ⚠️
- Cognitive Complexity: 31 (threshold: 15) ⚠️
- Nesting Depth: 6 (threshold: 4) ⚠️
- Function Length: 54 lines (threshold: 50) ⚠️
- Parameters: 5 (threshold: 3) ⚠️
- Dependencies: 3 files import this
- Churn: 8 commits, 2 contributors in last 30 days

**Problem:** 
Function handles pricing calculation with deeply nested conditionals for different user types, discount rules, and tax calculations. High churn indicates this is a problematic area.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/components/__tests__/UserProfile.test.tsx` covering all pricing scenarios
2. Extract method `calculateBasePrice()` from lines 145-165 to new file `src/utils/pricing/calculateBasePrice.ts`
3. Extract method `applyDiscounts()` from lines 166-180 to `src/utils/pricing/applyDiscounts.ts`
4. Extract method `calculateTax()` from lines 181-195 to `src/utils/pricing/calculateTax.ts`
5. Replace nested conditionals with guard clauses in main function
6. Create `PricingCalculator` class in `src/utils/pricing/PricingCalculator.ts` to orchestrate
7. Update main function to use `PricingCalculator` (reduced to ~10 lines)
8. Update imports in all 3 files that use this function

**Expected Outcome:**
- Cyclomatic Complexity: ≤8 per function
- Cognitive Complexity: ≤10 per function
- Nesting Depth: ≤3
- Main function: ~10 lines (orchestration only)
- Files created: 4 new files in `src/utils/pricing/`
- Behavior: Unchanged (all tests pass)

**Risk Level:** Medium ⚠️
- Function is used in 3 components
- Requires careful testing of pricing logic
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/components/__tests__/UserProfile.test.tsx`
- [ ] Test all edge cases: different user types, discount scenarios, tax calculations
- [ ] Execute complete refactoring (all steps above)
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

## Execution Readiness
- [x] ESLint complexity rules configured
- [x] Analysis complete
- [x] Refactoring plans created
- [ ] Ready for user approval to execute

## Next Steps (After User Approval)
1. Write tests for UserProfile.tsx calculateTotalPrice()
2. Execute complete refactoring (all 8 steps)
3. Verify metrics improvement and tests pass
4. Proceed to next hotspot
```

