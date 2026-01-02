# Job: Local Storage Mode - Optional Authentication

## User Stories

### User Story 1: Access Todos Without Authentication
**As a** user who hasn't configured Supabase  
**I want** to access the todos page without logging in  
**So that** I can use the app immediately

**Acceptance Criteria:**
- ✅ When Supabase is not configured, `/todos` is accessible without authentication
- ✅ Todos load from browser local storage
- ✅ No redirect to `/login` when accessing todos without Supabase
- ✅ Todos CRUD operations work with browser storage

### User Story 2: Clear Local Storage Mode Indication
**As a** user  
**I want** to see a clear message that the app is running in local storage mode  
**So that** I understand the limitations

**Acceptance Criteria:**
- ✅ When Supabase is not configured, show a clear info message about local storage mode
- ✅ Message appears on todos page and home page
- ✅ Message explains that data is stored locally and won't sync across devices
- ✅ Message provides link/guidance to configure Supabase if desired

### User Story 3: Optional Authentication Flow
**As a** user  
**I want** authentication to be optional when Supabase is not configured  
**So that** I can use the app without setting up a database

**Acceptance Criteria:**
- ✅ Login/signup pages show a message that authentication requires Supabase (already implemented)
- ✅ When Supabase is not configured, login/signup attempts show a helpful error message (already implemented)
- ✅ Navigation shows todos link even when not authenticated (when Supabase not configured)
- ✅ Home page shows todos link when Supabase not configured

### User Story 4: Seamless Transition to Supabase
**As a** user  
**I want** to configure Supabase later and have my browser-stored todos remain accessible  
**So that** I can transition smoothly

**Acceptance Criteria:**
- ✅ Browser-stored todos remain accessible after Supabase configuration
- ✅ When Supabase is configured, authentication becomes required for todos
- ✅ Clear messaging about the difference between browser storage and Supabase storage

## Chosen Implementation Plan: Plan A - Conditional ProtectedRoute

### Component/API Design
- Modify `ProtectedRoute` to check `isSupabaseConfigured()` before requiring authentication
- When Supabase is not configured, allow access without user authentication
- Keep existing interface, add internal conditional logic
- No breaking changes to component API

### State & Data Flow
- No new state management needed
- Use existing `isSupabaseConfigured()` utility function
- Auth context already returns `null` user when Supabase not configured (no error)
- Data provider factory already returns `BrowserStorageProvider` when Supabase not configured

### UI/UX Considerations
- **Todos Page**: Accessible without login when Supabase not configured
- **Info Banner**: Show clear message on todos page explaining local storage mode
- **Home Page**: Show "Go to Todos" button when Supabase not configured (even without login)
- **Navigation**: Show "Todos" link in nav bar when Supabase not configured (even without login)
- **Login/Signup Pages**: Already show info messages (no changes needed)

### Accessibility Planning
- No new keyboard interactions required
- Info messages use proper ARIA roles (MUI Alert components)
- Semantic HTML maintained
- Focus management unchanged

### Technical Considerations

#### Files to Modify:
1. **`src/components/ProtectedRoute.tsx`**
   - Add `isSupabaseConfigured()` check
   - Allow access when Supabase not configured, even without user
   - Keep redirect behavior when Supabase is configured but user not logged in

2. **`src/pages/HomePage.tsx`**
   - Show "Go to Todos" button when Supabase not configured
   - Show button even when user is null
   - Update conditional rendering logic

3. **`src/layouts/MainLayout.tsx`**
   - Show "Todos" link in navigation when Supabase not configured
   - Show link even when user is null
   - Update conditional rendering logic

4. **`src/pages/TodosPage.tsx`**
   - Enhance existing info message
   - Make message more prominent and informative
   - Add link to setup wizard

#### Files Already Complete:
- ✅ `src/features/auth/components/LoginForm.tsx` - Already shows info message
- ✅ `src/features/auth/components/SignUpForm.tsx` - Already shows info message
- ✅ `src/features/todos/services/todoBrowserStorage.ts` - Already works
- ✅ `src/shared/services/dataProviders/providerFactory.ts` - Already returns BrowserStorageProvider

#### Dependencies:
- No new dependencies needed
- Uses existing `isSupabaseConfigured()` from `@shared/services/supabaseService`

#### Integration Points:
- `ProtectedRoute` integrates with existing auth context
- `HomePage` and `MainLayout` integrate with existing auth context
- No changes to data provider layer needed

#### Complexity Assessment:
- **Cyclomatic Complexity**: Low (adds simple conditional checks)
- **Nesting Depth**: ≤ 3 (within acceptable limits)
- **Code Duplication**: Minimal (reuses existing patterns)

### Validation & Testing Plan

#### Manual Testing Steps:
1. **Test without Supabase configured:**
   - Start app without `.env` file or with invalid Supabase credentials
   - Navigate to `/todos` - should work without login
   - Verify todos load from browser storage
   - Create, update, delete todos - should work
   - Verify info message appears on todos page
   - Verify "Todos" link appears in navigation
   - Verify "Go to Todos" button appears on home page

2. **Test with Supabase configured but not logged in:**
   - Configure Supabase in `.env`
   - Navigate to `/todos` - should redirect to `/login`
   - Verify authentication is required

3. **Test with Supabase configured and logged in:**
   - Login with valid credentials
   - Navigate to `/todos` - should work
   - Verify todos load from Supabase
   - Verify no local storage message appears

4. **Test transition:**
   - Use app without Supabase (create todos)
   - Configure Supabase
   - Verify browser-stored todos remain accessible
   - Login and verify Supabase todos are separate

#### Key Test Cases:
- ✅ Access todos without Supabase and without login
- ✅ Access todos with Supabase but without login (should redirect)
- ✅ Access todos with Supabase and with login (should work)
- ✅ Navigation links visibility based on Supabase config
- ✅ Info messages appear correctly
- ✅ Todos CRUD operations work in all modes

## Implementation Notes

- All changes are backward compatible
- No breaking changes to existing APIs
- Follows existing architectural patterns
- Maintains consistency with codebase style
- Uses existing utility functions and patterns





