# Anonymous User UI Fix - Implementation Plan

## Problem
Anonymous users were being displayed as signed-in users in the UI. When an anonymous user opened the profile menu, they saw "User" and a "Sign Out" option instead of sign-in options.

## Root Cause
The code was using custom metadata checks (`app_metadata.provider` and `identities`) instead of Supabase's official `is_anonymous` property. This led to unreliable detection of anonymous users.

## Solution
Implemented Supabase's recommended approach using the official `is_anonymous` property:

1. **Created shared utility** (`src/features/auth/utils/userUtils.ts`):
   - `isAnonymousUser()` - Checks `is_anonymous` property
   - `supabaseUserToUser()` - Converts Supabase user to app User, filtering anonymous users

2. **Updated all conversion points**:
   - `useAuth.ts` - Uses shared utility for session user conversion
   - `authService.ts` - Updated `login()`, `signUp()`, and `getCurrentUser()` to filter anonymous users

## Changes Made

### New File: `src/features/auth/utils/userUtils.ts`
- Utility functions for anonymous user detection and conversion
- Uses official Supabase `User` type from `@supabase/supabase-js`
- Checks `is_anonymous` property (official Supabase way)

### Modified Files:
1. `src/features/auth/hooks/useAuth.ts`
   - Removed inline `supabaseUserToUser()` function
   - Imports and uses shared utility from `userUtils.ts`

2. `src/features/auth/services/authService.ts`
   - Updated `login()`, `signUp()`, and `getCurrentUser()` to use `supabaseUserToUser()` utility
   - Ensures anonymous users are filtered at all entry points

## Testing Instructions

### Prerequisites
- Supabase must be configured (via Setup wizard)
- Browser developer tools open (to inspect console/logs)

### Test 1: Anonymous User Shows Sign-In Options

**Steps:**
1. Clear browser storage (localStorage, sessionStorage, cookies)
2. Open the app in a new incognito/private window
3. Navigate to the app (should create anonymous session automatically)
4. Click on the profile menu icon (avatar) in the top right

**Expected Result:**
- Profile menu should show:
  - "Sign In with Google" option
  - "Login met schoolaccount" option (if Entreefederatie enabled)
- Should NOT show:
  - User name/email
  - "Sign Out" option
  - User profile information

**Verification:**
- Check browser console for any errors
- Verify `user` in AuthContext is `null` (can inspect via React DevTools)

### Test 2: Anonymous User Cannot Access Protected Routes

**Steps:**
1. As anonymous user (from Test 1)
2. Try to navigate to `/todos` (either via URL or if Todos button appears)

**Expected Result:**
- Should be redirected to `/login` page
- Should NOT see Todos page content

**Verification:**
- URL should change to `/login`
- Login page should be displayed

### Test 3: Anonymous User Does Not See Authenticated Features

**Steps:**
1. As anonymous user
2. Look at the top navigation bar

**Expected Result:**
- Should NOT see "Todos" button in navigation
- Should only see "Setup" button and profile menu

**Verification:**
- Topbar component checks `{user && ...}` - should be false for anonymous

### Test 4: Authenticated User Still Works Correctly

**Steps:**
1. Sign in with Google or email/password
2. After successful authentication, check profile menu

**Expected Result:**
- Profile menu should show:
  - User email/name
  - "Sign Out" option
- Should NOT show sign-in options

**Verification:**
- `user` in AuthContext should be non-null
- User object should have `id` and `email` properties

### Test 5: Sign Out Creates Anonymous Session But Doesn't Show as Logged In

**Steps:**
1. As authenticated user (from Test 4)
2. Click "Sign Out"
3. Wait for logout to complete
4. Check profile menu

**Expected Result:**
- Anonymous session should be created (for backend operations)
- Profile menu should show sign-in options (not user info)
- Should NOT show as logged in

**Verification:**
- Check browser console - anonymous session should be created
- Profile menu should match Test 1 results
- `user` in AuthContext should be `null`

### Test 6: Page Refresh Maintains Correct State

**Steps:**
1. As anonymous user
2. Refresh the page (F5)
3. Check profile menu immediately after load

**Expected Result:**
- Should still show sign-in options
- Should NOT show as logged in
- Loading state should complete correctly

**Verification:**
- Profile menu should match Test 1
- No console errors during page load

### Test 7: Edge Case - Anonymous User with Missing Metadata

**Steps:**
1. Create anonymous session
2. Manually inspect session in browser DevTools
3. Verify detection still works

**Expected Result:**
- Should still detect as anonymous using `is_anonymous` property
- Should show sign-in options

**Verification:**
- Check `session.user.is_anonymous` in console
- Should be `true` for anonymous users

## Debugging Tips

### Check User State
```javascript
// In browser console, if AuthContext is accessible:
// Check if user is null (should be null for anonymous)
console.log('User:', user);
```

### Check Supabase Session
```javascript
// In browser console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Session user:', session?.user);
console.log('Is anonymous:', session?.user?.is_anonymous);
```

### Verify Utility Function
The utility function should return `null` for anonymous users:
```typescript
import { supabaseUserToUser } from './features/auth/utils/userUtils';
// Should return null for anonymous users
const user = supabaseUserToUser(supabaseUser);
```

## Success Criteria

✅ Anonymous users see sign-in options in ProfileMenu  
✅ Anonymous users are redirected by ProtectedRoute  
✅ Anonymous users don't see authenticated-only features (Todos button)  
✅ All code paths that convert Supabase users filter anonymous users  
✅ Authenticated users still work correctly  
✅ Sign out creates anonymous session but doesn't show as logged in  
✅ Page refresh maintains correct state  

## Technical Details

### How It Works
1. When anonymous session is created via `signInAnonymously()`, Supabase sets `user.is_anonymous = true`
2. Our `supabaseUserToUser()` utility checks this property
3. If `is_anonymous === true`, function returns `null`
4. UI components check `user !== null` to determine logged-in state
5. Since anonymous users return `null`, they're treated as not logged in

### Key Files
- `src/features/auth/utils/userUtils.ts` - Shared utility functions
- `src/features/auth/hooks/useAuth.ts` - Auth hook using utility
- `src/features/auth/services/authService.ts` - Auth service using utility
- `src/components/ProfileMenu.tsx` - UI component checking `user !== null`
- `src/components/ProtectedRoute.tsx` - Route guard checking `user !== null`
- `src/components/Topbar.tsx` - Navigation checking `user !== null`

## Notes
- Uses Supabase's official `is_anonymous` property (recommended approach)
- No custom metadata checks needed
- Consistent filtering across all code paths
- Type-safe with TypeScript



