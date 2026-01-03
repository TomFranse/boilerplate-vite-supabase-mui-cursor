# Complexity Reduction Analysis

## ESLint Configuration Status
- Complexity rules: ✅ Added to eslint.config.js
- Thresholds: 
  - `complexity`: 10 (cyclomatic complexity)
  - `max-depth`: 4 (nesting depth)
  - `max-lines-per-function`: 50 (function length)
  - `max-statements`: 10 (statement count)
  - `max-params`: 3 (parameter count)
  - `sonarjs/cognitive-complexity`: 15 (cognitive complexity)
- Plugin status: ✅ eslint-plugin-sonarjs installed

## Current State
- Total complexity violations: 44 warnings
- Files with violations: 23 files
- Average cyclomatic complexity: ~15 (highest: 42)
- Language focus: TypeScript (primary)

## Git Churn Analysis (Last 30 Days)
High churn files (modified multiple times):
- `src/features/auth/services/authService.ts` - 3 commits
- `src/features/auth/hooks/useAuth.ts` - 3 commits
- `src/utils/setupUtils.ts` - Multiple commits
- `src/pages/setup/sections/SupabaseSection.tsx` - Multiple commits
- `src/pages/setup/sections/AirtableSection.tsx` - Multiple commits
- `src/pages/SetupPage.tsx` - Multiple commits

## Top Priority Hotspots

### 1. ProfileMenu.tsx - Critical Priority ⚠️

**Location:** `src/components/ProfileMenu.tsx:31:408`
**Current Metrics:**
- Cyclomatic Complexity: 42 (threshold: 10) ⚠️
- Cognitive Complexity: 22 (threshold: 15) ⚠️
- Function Length: 357 lines (threshold: 50) ⚠️
- Statements: 20 (threshold: 10) ⚠️
- Parameters: 1 (within threshold)
- Dependencies: Used by Topbar component
- Churn: 1 commit in last 30 days

**Problem:** 
The ProfileMenu component has massive code duplication - the same JSX structure is rendered twice (once for internal anchor mode, once for external anchor mode). The component handles multiple responsibilities: menu rendering, user profile display, sign-in options, and state management. The complexity comes from deeply nested conditionals and duplicate rendering logic.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/components/__tests__/ProfileMenu.test.tsx` covering:
   - Internal vs external anchor modes
   - Logged in vs logged out states
   - Profile display with various data combinations
   - Sign-in button interactions
   - Sign-out functionality
2. Extract `ProfileInfo` component from lines 152-231 and 292-371 to `src/components/ProfileMenu/ProfileInfo.tsx`
3. Extract `SignInMenuItems` component from lines 241-257 and 381-397 to `src/components/ProfileMenu/SignInMenuItems.tsx`
4. Extract `ProfileMenuContent` component that takes `isLoggedIn` and `supabaseConfigured` props, consolidating duplicate menu content
5. Extract helper functions to separate file `src/components/ProfileMenu/profileHelpers.ts`:
   - `getDisplayName()` (lines 81-85)
   - `getAvatarInitial()` (lines 87-95)
   - `getAvatarUrl()` (lines 97-99)
   - `getRoleDisplay()` (lines 101-110)
6. Refactor main component to use extracted components (reduced to ~80 lines)
7. Update imports in `src/components/Topbar.tsx` if needed

**Expected Outcome:**
- Cyclomatic Complexity: ≤8 per function
- Cognitive Complexity: ≤10 per function
- Main component: ~80 lines (orchestration only)
- ProfileMenuContent: ~50 lines
- ProfileInfo: ~40 lines
- SignInMenuItems: ~20 lines
- Files created: 4 new files in `src/components/ProfileMenu/`
- Behavior: Unchanged (all tests pass)

**Risk Level:** Medium ⚠️
- Component is used in Topbar
- Requires careful testing of all rendering modes
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/components/__tests__/ProfileMenu.test.tsx`
- [ ] Test all edge cases: internal/external anchor, logged in/out, various profile states
- [ ] Execute complete refactoring (all steps above)
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

### 2. dateFormatters.ts - formatRelativeTime() - High Priority

**Location:** `src/utils/dateFormatters.ts:28:64`
**Current Metrics:**
- Cyclomatic Complexity: 14 (threshold: 10) ⚠️
- Cognitive Complexity: 18 (threshold: 15) ⚠️
- Function Length: 37 lines (within threshold)
- Statements: 22 (threshold: 10) ⚠️
- Parameters: 1 (within threshold)
- Dependencies: Used by TodoItem component
- Churn: 0 commits in last 30 days

**Problem:** 
The `formatRelativeTime` function has a long chain of if-else statements calculating time differences (seconds → minutes → hours → days → weeks → months → years). Each branch has similar logic for pluralization, creating cognitive complexity.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/utils/__tests__/dateFormatters.test.tsx` covering:
   - All time ranges (seconds, minutes, hours, days, weeks, months, years)
   - Pluralization logic
   - Edge cases (0, 1, >1)
   - Future dates (should handle gracefully)
2. Extract time calculation logic to `calculateTimeDifference()` helper function
3. Create `TimeUnit` type and `TIME_UNITS` array with thresholds and labels
4. Refactor to use array-based lookup instead of if-else chain
5. Extract pluralization to `pluralize()` helper function
6. Main function reduced to ~15 lines using lookup pattern

**Expected Outcome:**
- Cyclomatic Complexity: ≤5
- Cognitive Complexity: ≤8
- Statements: ≤8
- Function Length: ~15 lines
- Files created: None (refactor within same file)
- Behavior: Unchanged (all tests pass)

**Risk Level:** Low ⚠️
- Isolated utility function
- Clear extraction pattern
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/utils/__tests__/dateFormatters.test.tsx`
- [ ] Test all time ranges and pluralization
- [ ] Execute complete refactoring
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

### 3. SupabaseSection.tsx & AirtableSection.tsx - High Priority

**Location:** 
- `src/pages/setup/sections/SupabaseSection.tsx:43:278` (SupabaseDialog)
- `src/pages/setup/sections/AirtableSection.tsx:54:276` (AirtableDialog)

**Current Metrics:**
- SupabaseDialog:
  - Cyclomatic Complexity: 18 (threshold: 10) ⚠️
  - Function Length: 217 lines (threshold: 50) ⚠️
  - Statements: 12 (threshold: 10) ⚠️
- AirtableDialog:
  - Cyclomatic Complexity: 13 (threshold: 10) ⚠️
  - Function Length: 211 lines (threshold: 50) ⚠️
  - Statements: 11 (threshold: 10) ⚠️
- Dependencies: Used by SetupPage
- Churn: Multiple commits in last 30 days

**Problem:** 
Both dialog components follow nearly identical patterns: form fields, connection testing, environment variable display, copy-to-clipboard functionality. The complexity comes from nested conditionals for test results, env writing status, and UI state management. There's significant code duplication between the two components.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/pages/setup/sections/__tests__/SupabaseSection.test.tsx` and `AirtableSection.test.tsx` covering:
   - Form validation
   - Connection testing
   - Environment variable writing
   - Copy functionality
   - Save/skip actions
2. Extract common `ConnectionTestDialog` component to `src/pages/setup/components/ConnectionTestDialog.tsx`:
   - Handles form fields, testing, env writing, copy functionality
   - Takes configuration object with field definitions
3. Extract `EnvVariablesDisplay` component to `src/pages/setup/components/EnvVariablesDisplay.tsx`:
   - Displays env vars in card format
   - Handles copy-to-clipboard
4. Extract `ConnectionTestResult` component to `src/pages/setup/components/ConnectionTestResult.tsx`:
   - Shows success/error alerts
   - Handles loading states
5. Create configuration objects for Supabase and Airtable:
   - `SUPABASE_CONFIG` and `AIRTABLE_CONFIG` with field definitions, labels, placeholders
6. Refactor SupabaseDialog to use ConnectionTestDialog with SUPABASE_CONFIG (~30 lines)
7. Refactor AirtableDialog to use ConnectionTestDialog with AIRTABLE_CONFIG (~30 lines)

**Expected Outcome:**
- SupabaseDialog: ~30 lines (orchestration)
- AirtableDialog: ~30 lines (orchestration)
- ConnectionTestDialog: ~120 lines (reusable)
- EnvVariablesDisplay: ~40 lines
- ConnectionTestResult: ~30 lines
- Cyclomatic Complexity: ≤8 per component
- Cognitive Complexity: ≤10 per component
- Files created: 3 new shared components
- Behavior: Unchanged (all tests pass)

**Risk Level:** Medium ⚠️
- Core setup functionality
- Multiple dependencies
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test files for both sections
- [ ] Test all connection scenarios, form validation, env writing
- [ ] Execute complete refactoring (all steps above)
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

### 4. useAuth.ts - Medium-High Priority

**Location:** `src/features/auth/hooks/useAuth.ts:34:202`
**Current Metrics:**
- Main hook: 142 lines (threshold: 50) ⚠️
- `initAuth`: 53 lines (threshold: 50) ⚠️
- `initAuth`: 11 statements (threshold: 10) ⚠️
- `onAuthStateChange` handler: 12 statements (threshold: 10) ⚠️
- `handleSignInWithGoogle`: 12 statements (threshold: 10) ⚠️
- `handleSignInWithEntreefederatie`: 12 statements (threshold: 10) ⚠️
- Dependencies: Used by AuthContext, LoginForm, SignUpForm
- Churn: 3 commits in last 30 days

**Problem:** 
The `useAuth` hook handles multiple responsibilities: session initialization, OAuth redirect detection, anonymous sign-in, auth state changes, and multiple sign-in methods. The complexity comes from nested conditionals and multiple async operations.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/features/auth/hooks/__tests__/useAuth.test.tsx` covering:
   - Initial session loading
   - OAuth redirect detection
   - Anonymous sign-in logic
   - Auth state changes
   - All sign-in methods
2. Extract `isOAuthRedirectInProgress()` to separate file `src/features/auth/utils/oauthUtils.ts`
3. Extract `initializeSession()` function from `initAuth` (lines 49-72)
4. Extract `handleAuthStateChange()` function from `onAuthStateChange` handler (lines 79-102)
5. Extract `createSignInHandler()` factory function to reduce duplication between Google and Entreefederatie handlers
6. Refactor main hook to orchestrate extracted functions (~60 lines)

**Expected Outcome:**
- Main hook: ~60 lines
- `initializeSession`: ~25 lines
- `handleAuthStateChange`: ~25 lines
- `createSignInHandler`: ~15 lines
- Statements: ≤8 per function
- Files created: 1 new utility file
- Behavior: Unchanged (all tests pass)

**Risk Level:** Medium ⚠️
- Core authentication hook
- Used by multiple components
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/features/auth/hooks/__tests__/useAuth.test.tsx`
- [ ] Test all auth scenarios and edge cases
- [ ] Execute complete refactoring (all steps above)
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

### 5. useUserProfile.ts - fetchProfile() - Medium Priority

**Location:** `src/features/auth/hooks/useUserProfile.ts:47:106`
**Current Metrics:**
- Function Length: 56 lines (threshold: 50) ⚠️
- Statements: 19 (threshold: 10) ⚠️
- Parameters: 0 (within threshold)
- Dependencies: Used by ProfileMenu
- Churn: 0 commits in last 30 days

**Problem:** 
The `fetchProfile` function has a long select query string and multiple error handling branches. The complexity comes from the large field list and nested error handling.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/features/auth/hooks/__tests__/useUserProfile.test.tsx` covering:
   - Successful profile fetch
   - User not found (PGRST116)
   - Other errors
   - No user case
   - Supabase not configured case
2. Extract `USER_PROFILE_FIELDS` constant with the field list (lines 61-83)
3. Extract `handleProfileFetchError()` function for error handling (lines 88-96)
4. Refactor `fetchProfile` to use extracted constants and functions (~35 lines)

**Expected Outcome:**
- `fetchProfile`: ~35 lines
- Statements: ≤8
- Files created: None (refactor within same file)
- Behavior: Unchanged (all tests pass)

**Risk Level:** Low ⚠️
- Isolated hook
- Clear extraction pattern
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/features/auth/hooks/__tests__/useUserProfile.test.tsx`
- [ ] Test all fetch scenarios and error cases
- [ ] Execute complete refactoring
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

### 6. AuthCallbackPage.tsx - handleAuthCallback() - Medium Priority

**Location:** `src/pages/AuthCallbackPage.tsx:17:54`
**Current Metrics:**
- Statements: 20 (threshold: 10) ⚠️
- Function Length: 38 lines (within threshold)
- Parameters: 0 (within threshold)
- Dependencies: Used by App routing
- Churn: 1 commit in last 30 days

**Problem:** 
The `handleAuthCallback` function has multiple early returns and nested try-catch blocks. The complexity comes from sequential error checking and navigation logic.

**Complete Refactoring Plan (Agent will execute fully):**
1. Write tests: Create `src/pages/__tests__/AuthCallbackPage.test.tsx` covering:
   - Error parameter handling
   - Code exchange success
   - Code exchange failure
   - No parameters case
   - Redirect path handling
2. Extract `handleAuthError()` function for error parameter handling (lines 24-30)
3. Extract `handleCodeExchange()` function for code exchange logic (lines 33-49)
4. Extract `getRedirectPath()` function that combines redirect path logic
5. Refactor main function to orchestrate extracted functions (~15 lines)

**Expected Outcome:**
- Main function: ~15 lines
- `handleAuthError`: ~8 lines
- `handleCodeExchange`: ~18 lines
- `getRedirectPath`: ~3 lines
- Statements: ≤6 per function
- Files created: None (refactor within same file)
- Behavior: Unchanged (all tests pass)

**Risk Level:** Low ⚠️
- Isolated page component
- Clear extraction pattern
- **Proceeding with complete refactoring**

**Testing Strategy (Mandatory):**
- [ ] Write unit tests for current behavior BEFORE refactoring
- [ ] Create test file: `src/pages/__tests__/AuthCallbackPage.test.tsx`
- [ ] Test all callback scenarios and error cases
- [ ] Execute complete refactoring
- [ ] Verify all tests still pass after refactor
- [ ] Run complexity analysis: verify metrics meet thresholds
- [ ] Run type-check and linter

---

## Refactoring Techniques to Apply

1. **Extract Component:** ProfileMenu, SupabaseSection, AirtableSection
2. **Extract Method:** dateFormatters, useAuth, useUserProfile, AuthCallbackPage
3. **Replace Conditional with Lookup:** dateFormatters (time units)
4. **Extract Constants:** useUserProfile (field list), SupabaseSection/AirtableSection (configs)
5. **Factory Pattern:** useAuth (sign-in handlers)
6. **Guard Clauses:** All refactorings will use early returns

## Execution Readiness
- [x] ESLint complexity rules configured
- [x] Analysis complete
- [x] Refactoring plans created
- [ ] Ready for user approval to execute

## Next Steps (After User Approval)
1. Write tests for ProfileMenu.tsx (highest priority)
2. Execute complete refactoring for ProfileMenu.tsx
3. Verify metrics improvement and tests pass
4. Proceed to dateFormatters.ts
5. Continue with remaining hotspots in priority order

## Additional Notes

- **Quick Wins:** Several smaller violations can be addressed during main refactorings
- **Pattern Recognition:** SupabaseSection and AirtableSection share patterns that can be abstracted
- **Test Coverage:** All refactorings will include comprehensive test coverage before changes
- **Risk Management:** Higher risk refactorings (ProfileMenu, setup sections) will be flagged but proceed with complete implementation

