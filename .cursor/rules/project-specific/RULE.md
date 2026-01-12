---
description: "Project-specific rate limiting and security patterns for Edge Functions"
alwaysApply: false
globs: ["**/supabase/functions/**/*.ts"]
---

# Rate Limiting and Security Rules

## Current Implementation: Supabase Edge Functions

This document describes rate limiting patterns for Supabase Edge Functions. See "Legacy: Firebase Cloud Functions" section below for previous Firebase implementation.

## When to Implement Rate Limiting

Rate limiting MUST be implemented for:

### 1. **Expensive Operations**
- Database scans (e.g., `listUsers`, `listAll*`)
- Batch operations (e.g., `backfill*`, `migrate*`, `sync*`)
- External API calls with costs (e.g., OpenAI, payment gateways)
- File uploads/downloads
- Report generation

### 2. **Write Operations**
- User data mutations (e.g., `updateProfile`, `setPermissions`)
- Status changes (e.g., `setDeveloperStatus`, `toggleFeature`)
- Content creation (e.g., `createPost`, `sendMessage`)
- Any operation that modifies shared state

### 3. **Authentication-Related Functions**
- Password reset requests
- Email verification sends
- Account creation
- Login attempts (implement exponential backoff)

### 4. **Public or Semi-Public Endpoints**
- Any callable function accessible by non-admin users
- Webhooks
- API proxies

---

## Rate Limiting Strategy

### Storage: Supabase PostgreSQL Table
Store rate limit counters in a dedicated `rate_limits` table:

```sql
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY,           -- Format: {user_id}_{function_name}
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL,
  last_request TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_user_function ON rate_limits(user_id, function_name);
```

### Row Level Security (RLS)

**SSOT:** See `security/RULE.md` for RLS policy performance best practices.

```sql
-- Only Edge Functions (service role) can read/write rate limit data
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edge Functions only" ON rate_limits
  FOR ALL
  USING (false);  -- Service role bypasses RLS, so this blocks client access
```

---

## Implementation Pattern

### 1. Create Reusable Helper Function

Add to `supabase/functions/_shared/rateLimit.ts`:

```typescript
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Rate limiter for Supabase Edge Functions.
 * @param userId User ID
 * @param action Action name (e.g., 'listUsers')
 * @param maxRequests Maximum requests allowed in time window
 * @param windowMs Time window in milliseconds
 * @return Promise<boolean> True if allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const limitId = `${userId}_${action}`;

  try {
    // Get existing rate limit record
    const {data: existing, error: fetchError} = await supabase
      .from('rate_limits')
      .select('*')
      .eq('id', limitId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is OK
      console.error('[RateLimit] Error fetching:', fetchError);
      return true; // Fail open
    }

    if (!existing) {
      // First request, create the record
      const {error: insertError} = await supabase
        .from('rate_limits')
        .insert({
          id: limitId,
          user_id: userId,
          function_name: action,
          count: 1,
          window_start: now.toISOString(),
          last_request: now.toISOString(),
        });

      if (insertError) {
        console.error('[RateLimit] Error inserting:', insertError);
        return true; // Fail open
      }
      return true;
    }

    const windowStart = new Date(existing.window_start);
    const timeSinceWindowStart = now.getTime() - windowStart.getTime();

    // If past the time window, reset counter
    if (timeSinceWindowStart > windowMs) {
      const {error: updateError} = await supabase
        .from('rate_limits')
        .update({
          count: 1,
          window_start: now.toISOString(),
          last_request: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', limitId);

      if (updateError) {
        console.error('[RateLimit] Error resetting:', updateError);
        return true; // Fail open
      }
      return true;
    }

    // Check if limit exceeded
    if (existing.count >= maxRequests) {
      console.warn('[RateLimit] Exceeded', {
        userId,
        action,
        count: existing.count,
        maxRequests,
        windowMs,
      });
      return false;
    }

    // Increment counter
    const {error: incrementError} = await supabase
      .from('rate_limits')
      .update({
        count: existing.count + 1,
        last_request: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', limitId);

    if (incrementError) {
      console.error('[RateLimit] Error incrementing:', incrementError);
      return true; // Fail open
    }
    return true;
  } catch (error) {
    console.error('[RateLimit] Exception:', error);
    // Fail open - allow request if rate limit check fails
    return true;
  }
}
```

---

### 2. Apply to Edge Functions

Add rate limiting **after** authentication but **before** main logic:

```typescript
import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';
import {corsHeaders} from '../_shared/cors.ts';
import {checkRateLimit} from '../_shared/rateLimit.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  try {
    // 1. Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({error: 'Unauthorized'}),
        {status: 401, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace('Bearer ', '');
    const {data: {user}, error: authError} = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({error: 'Unauthorized'}),
        {status: 401, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 2. Verify authorization (if needed)
    // Check user role, etc.

    // 3. CHECK RATE LIMIT
    const isAllowed = await checkRateLimit(user.id, 'listUsers', 10, 60000);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({error: 'Rate limit exceeded. Please try again in a minute.'}),
        {status: 429, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 4. Execute main logic
    // ... your function logic here

    return new Response(
      JSON.stringify({success: true}),
      {status: 200, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
    );
  } catch (error) {
    return new Response(
      JSON.stringify({error: error.message}),
      {status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
    );
  }
});
```

---

## Rate Limit Guidelines

### Suggested Limits by Operation Type

| Operation Type | Limit | Window | Reasoning |
|---------------|-------|--------|-----------|
| **Read-heavy (lists, queries)** | 10-20 | 1 minute | Allow reasonable browsing |
| **Write operations** | 5-10 | 1 minute | Prevent spam/abuse |
| **Expensive operations** | 2-5 | 5 minutes | Protect costs |
| **Batch operations** | 1-2 | 5-10 minutes | Very expensive |
| **Authentication** | 3-5 | 15 minutes | Prevent brute force |
| **Password reset** | 2 | 1 hour | Prevent email spam |

### Adjust Based On:
- **User role**: Admins/developers can have higher limits
- **Cost**: OpenAI API calls = stricter limits
- **Database load**: Heavy queries = stricter limits
- **Abuse risk**: Public endpoints = stricter limits

---

## Error Messages

Use clear, user-friendly error messages:

```javascript
// Good ✅
'Rate limit exceeded. Please try again in a minute.'
'Rate limit exceeded. This is an expensive operation. Please try again in 5 minutes.'
'Too many requests. Please wait 15 minutes before trying again.'

// Bad ❌
'Rate limit exceeded.'
'Too many requests.'
'Error 429'
```

---

## Testing Rate Limits

### Manual Testing
```javascript
// In browser console or test script:
for (let i = 0; i < 15; i++) {
  await yourCallableFunction();
  console.log(`Request ${i + 1} completed`);
}
// Expected: First 10 succeed, rest fail with rate limit error
```

### Automated Testing
```javascript
// In functions test suite
it('should rate limit after max requests', async () => {
  const uid = 'test_user_123';
  const action = 'testAction';
  
  // Make maxRequests successful calls
  for (let i = 0; i < 10; i++) {
    const allowed = await checkRateLimit(uid, action, 10, 60000);
    expect(allowed).toBe(true);
  }
  
  // Next call should be rate limited
  const blocked = await checkRateLimit(uid, action, 10, 60000);
  expect(blocked).toBe(false);
});
```

---

## Monitoring and Cleanup

### Monitor Rate Limits
```sql
-- Supabase SQL Editor → Query rate_limits table
SELECT * FROM rate_limits
WHERE count >= maxRequests - 1  -- Near limit
ORDER BY last_request DESC;

-- Look for:
-- - High count values (near maxRequests)
-- - Same user hitting multiple limits
-- - Patterns indicating abuse
```

### Automatic Cleanup (Optional)
Create a PostgreSQL function and trigger, or use a scheduled Edge Function:

```sql
-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE last_request < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron extension (if enabled)
SELECT cron.schedule('cleanup-rate-limits', '0 0 * * *', 'SELECT cleanup_old_rate_limits()');
```

Or use a Supabase Edge Function with cron:

```typescript
// supabase/functions/cleanup-rate-limits/index.ts
import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  const {data, error} = await supabase
    .from('rate_limits')
    .delete()
    .lt('last_request', oneDayAgo);

  if (error) {
    console.error('Cleanup error:', error);
    return new Response(JSON.stringify({error: error.message}), {status: 500});
  }

  return new Response(JSON.stringify({deleted: data?.length || 0}), {status: 200});
});
```

---

## Privacy and Security

### Why This Approach?
- ✅ **No third-party tracking** (unlike reCAPTCHA)
- ✅ **User privacy preserved**
- ✅ **Full control over limits and data**
- ✅ **GDPR-friendly**

### Security Rules

**SSOT:** See `security/RULE.md` for RLS policy performance best practices.

Always protect the `rate_limits` table with RLS:
```sql
-- Only Edge Functions (service role) can read/write rate limit data
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edge Functions only" ON rate_limits
  FOR ALL
  USING (false);  -- Service role bypasses RLS, so this blocks client access
```

### Fail Open vs Fail Closed
**This implementation uses "fail open"**: If rate limit check fails due to an error, the request is allowed.

**Reasoning:**
- Prevents blocking legitimate users during outages
- Better UX than false positives
- Logs errors for monitoring

**When to fail closed:**
- Authentication endpoints (security > UX)
- Payment processing
- Critical operations

---

## Checklist for New Functions

Before deploying a new Edge Function, ask:

- [ ] Is this function abusable (expensive/write/public)?
- [ ] Have I added `checkRateLimit()` call?
- [ ] Did I choose appropriate limits (requests/window)?
- [ ] Is the error message user-friendly?
- [ ] Did I add JSDoc with rate limit info?
- [ ] Did I test the rate limit manually?
- [ ] Is `rate_limits` table protected with RLS?
- [ ] Did I use service role key for rate limit checks?

---

## Example: Complete Rate-Limited Function

```typescript
import {serve} from 'https://deno.land/std@0.168.0/http/server.ts';
import {corsHeaders} from '../_shared/cors.ts';
import {checkRateLimit} from '../_shared/rateLimit.ts';
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Sets user role.
 * Only accessible by admins.
 * Rate limit: 20 requests per minute per user.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  try {
    // 1. Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({error: 'Unauthorized'}),
        {status: 401, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace('Bearer ', '');
    const {data: {user}, error: authError} = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({error: 'Unauthorized'}),
        {status: 401, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 2. Authorization (check if user is admin)
    const {data: userData} = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'super-admin'].includes(userData.role)) {
      return new Response(
        JSON.stringify({error: 'Permission denied'}),
        {status: 403, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 3. Rate Limiting
    const isAllowed = await checkRateLimit(user.id, 'setUserRole', 20, 60000);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({error: 'Rate limit exceeded. Please try again in a minute.'}),
        {status: 429, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 4. Input Validation
    const body = await req.json();
    const {userId, role} = body;
    if (!userId || !role) {
      return new Response(
        JSON.stringify({error: 'Invalid request data'}),
        {status: 400, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    // 5. Main Logic
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const {error: updateError} = await supabaseAdmin
      .from('users')
      .update({role})
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating role:', updateError);
      return new Response(
        JSON.stringify({error: `Failed to update role: ${updateError.message}`}),
        {status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
      );
    }

    return new Response(
      JSON.stringify({success: true, userId, role}),
      {status: 200, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
    );
  } catch (error) {
    return new Response(
      JSON.stringify({error: error.message}),
      {status: 500, headers: {...corsHeaders, 'Content-Type': 'application/json'}},
    );
  }
});
```

---

## Summary

**Every abusable Edge Function should:**
1. Authenticate the user
2. Authorize the user (if needed)
3. **Check rate limit** ← THIS STEP
4. Validate input
5. Execute main logic
6. Handle errors gracefully

**Rate limiting protects:**
- Your Supabase costs
- Your external API costs (OpenAI, etc.)
- Your database from abuse
- Your users' experience (no slowdowns from abuse)

**And it does so without:**
- Third-party tracking
- User privacy concerns
- Complex external dependencies

---

## Legacy: Firebase Cloud Functions Rate Limiting (Deprecated)

> **Note:** This section documents the legacy Firebase Cloud Functions rate limiting implementation. The project has migrated to Supabase Edge Functions. This content is kept for reference during migration period.

### Legacy Storage: Firestore Collection

**Previously used Firestore collection:**
```javascript
// Document ID format: {uid}_{functionName}
{
  count: number,           // Current request count in window
  windowStart: timestamp,  // Start of current time window
  lastRequest: timestamp   // Last request timestamp
}
```

### Legacy Implementation Pattern

**Previous helper function:**
```javascript
async function checkRateLimit(uid, action, maxRequests, windowMs) {
  const db = admin.firestore();
  const now = Date.now();
  const rateLimitRef = db.collection('rateLimits').doc(`${uid}_${action}`);

  // ... Firestore operations using increment(), set(), update()
}
```

**Migration:** This has been replaced with Supabase PostgreSQL table and Edge Function implementation (see above).

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `security/RULE.md` - **SSOT** for RLS policy patterns (referenced in RLS sections)
- `cloud-functions/RULE.md` - Edge Functions architecture and when to use them
- `database/RULE.md` - Database migration patterns for rate_limits table

**Rules that reference this rule:**
- `security/RULE.md` - May reference rate limiting as a security pattern

