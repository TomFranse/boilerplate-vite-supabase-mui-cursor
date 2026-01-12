---
description: "Database migration best practices for Supabase/PostgreSQL"
alwaysApply: false
globs: ["**/supabase/migrations/**/*.sql", "**/supabase/**/*.sql"]
---

# Database Migrations Best Practices

## Overview

Database migrations must be safe for both fresh database resets and incremental updates. All migrations should be idempotent and handle edge cases gracefully.

---

## Critical Rules

### 1. Always Use Safe Patterns

**DO:**
- `CREATE OR REPLACE FUNCTION` - Safe to re-run
- `DROP IF EXISTS` - Safe if object doesn't exist
- `ADD COLUMN IF NOT EXISTS` - Safe if column already exists
- `CREATE INDEX IF NOT EXISTS` - Safe if index exists
- `ON CONFLICT DO NOTHING` - Safe for data migrations
- `ALTER TYPE ... ADD VALUE IF NOT EXISTS` - Safe for enum additions

**DON'T:**
- `CREATE FUNCTION` without `OR REPLACE` - Will fail if function exists
- `DROP` without `IF EXISTS` - Will fail if object doesn't exist
- `ADD COLUMN` without `IF NOT EXISTS` - Will fail if column exists
- `RAISE EXCEPTION` in validation blocks - Will fail migration unnecessarily

### 2. Validation Migrations Must Be Optional

**Problem:** Validation migrations that assume data exists will fail on fresh databases.

**Solution:** Make validations conditional:

```sql
-- ❌ BAD: Fails on fresh database
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM tools) = 0 THEN
    RAISE EXCEPTION 'Tools table is empty';
  END IF;
END $$;

-- ✅ GOOD: Skips validation on fresh database
DO $$
DECLARE
  tool_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  IF tool_count = 0 THEN
    RAISE NOTICE 'Tools table is empty - skipping validation (expected on fresh database)';
    RETURN;
  END IF;
  -- ... rest of validation
END $$;
```

### 3. Index Verification Should Be Informational

**Problem:** Index verification that raises exceptions will fail if previous migration failed.

**Solution:** Use `RAISE NOTICE` or `RAISE WARNING` instead of `RAISE EXCEPTION`:

```sql
-- ❌ BAD: Fails migration if index doesn't exist
IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example') THEN
  RAISE EXCEPTION 'Index does not exist';
END IF;

-- ✅ GOOD: Logs warning but allows migration to proceed
IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example') THEN
  RAISE NOTICE 'Index idx_example does not exist - skipping validation (expected on fresh database)';
ELSE
  RAISE NOTICE 'Index idx_example verified successfully';
END IF;
```

### 4. Data Migrations Must Handle Empty Tables

**Problem:** Data migrations that assume data exists will fail on fresh databases.

**Solution:** Use conditional checks or `ON CONFLICT`:

```sql
-- ✅ GOOD: Safe on empty table
INSERT INTO user_assistants (user_id, assistant_id)
SELECT id, unnest(accessible_assistant_ids)
FROM users
WHERE array_length(accessible_assistant_ids, 1) > 0
ON CONFLICT DO NOTHING;

-- ✅ GOOD: Safe on empty table
UPDATE files
SET message_id = (metadata->>'message_id')::uuid
WHERE metadata->>'message_id' IS NOT NULL
  AND message_id IS NULL;
```

### 5. Conditional Migrations Must Be Documented

**Problem:** Migrations with warnings (like "DO NOT APPLY UNTIL MERGING TO MAIN") are confusing.

**Solution:** Add conditional checks and clear documentation:

```sql
-- ✅ GOOD: Conditional migration with check
-- ⚠️ NOTE: This migration removes deprecated columns
-- Only applies if columns exist (safe on fresh database)
-- On fresh database: columns never existed, so this is a no-op

DO $$
BEGIN
  -- Only drop if columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'total_messages'
  ) THEN
    ALTER TABLE users DROP COLUMN IF EXISTS total_messages;
    RAISE NOTICE 'Dropped deprecated total_messages column';
  ELSE
    RAISE NOTICE 'total_messages column does not exist - skipping (expected on fresh database)';
  END IF;
END $$;
```

---

## Migration Patterns

### Function Creation/Replacement

```sql
-- ✅ Always use CREATE OR REPLACE
CREATE OR REPLACE FUNCTION function_name(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Function body
END;
$$;

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION function_name(...) TO authenticated;
REVOKE EXECUTE ON FUNCTION function_name(...) FROM public, anon;
```

### Table Modifications

```sql
-- ✅ Add columns safely
ALTER TABLE table_name
  ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;

-- ✅ Drop columns safely
ALTER TABLE table_name
  DROP COLUMN IF EXISTS column_name;

-- ✅ Add constraints safely (check data first)
-- Note: Constraints may fail if existing data violates them
-- Consider using NOT VALID initially, then VALIDATE later
ALTER TABLE table_name
  ADD CONSTRAINT constraint_name CHECK (condition);
```

### Index Creation

```sql
-- ✅ Always use IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);

-- ✅ Partial indexes
CREATE INDEX IF NOT EXISTS idx_name 
ON table_name(column_name) 
WHERE condition;
```

### Policy Management

```sql
-- ✅ Drop policies safely
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- ✅ Create policies (usually unique by name, but be careful)
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (condition);
```

### Enum Modifications

```sql
-- ✅ Add enum values safely
ALTER TYPE enum_name ADD VALUE IF NOT EXISTS 'new_value';

-- ⚠️ Note: Cannot remove enum values in PostgreSQL
-- Workaround: Create new enum, migrate data, drop old enum
```

### Trigger Management

```sql
-- ✅ Drop triggers safely
DROP TRIGGER IF EXISTS trigger_name ON table_name;

-- ✅ Create triggers
CREATE TRIGGER trigger_name
  BEFORE/AFTER INSERT/UPDATE/DELETE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION function_name();
```

---

## Migration File Naming

**Format:** `YYYYMMDDHHMMSS_description.sql`

**Examples:**
- `20250120000000_create_tools_table.sql`
- `20250120000001_fix_auth_trigger.sql`
- `20251217000000_create_get_storage_object_metadata_function.sql`

**Rules:**
- Use timestamp for ordering
- Use descriptive names
- Use snake_case
- Be specific about what the migration does

---

## Testing Migrations

### Before Committing

1. **Test on fresh database:**
   ```bash
   # Reset database
   supabase db reset
   
   # Run migrations
   supabase migration up
   ```

2. **Test incremental update:**
   ```bash
   # Apply only new migrations
   supabase migration up
   ```

3. **Verify no errors:**
   - Check migration logs
   - Verify all objects created correctly
   - Test critical functions

### Common Issues to Check

- ✅ Migrations run successfully on fresh database
- ✅ Migrations run successfully on existing database
- ✅ No `RAISE EXCEPTION` in validation blocks (use `RAISE NOTICE` or `RAISE WARNING`)
- ✅ All DROP operations use `IF EXISTS`
- ✅ All CREATE operations use `IF NOT EXISTS` or `OR REPLACE`
- ✅ Data migrations handle empty tables
- ✅ Function dependencies exist before use

---

## Revert Migrations

**Problem:** Revert migrations assume previous state exists.

**Solution:** Document what is being reverted and why:

```sql
-- ✅ GOOD: Document revert migration
-- Revert files RLS policies to original working version
-- The (select auth.uid()) optimization may be causing performance issues
-- This migration reverts changes from 20250120000002_optimize_files_table_performance.sql

-- Drop optimized policies (safe with IF EXISTS)
DROP POLICY IF EXISTS "Users can read own files" ON files;

-- Recreate original policies
CREATE POLICY "Users can read own files" ON files
  FOR SELECT USING (auth.uid() = owner_id);
```

---

## Function Dependencies

**Problem:** Functions that depend on other functions may fail if dependencies don't exist.

**Solution:** Ensure dependencies are created in earlier migrations:

```sql
-- ✅ GOOD: Check dependency exists or create it
-- Function uses is_admin_user() which must exist
-- Created in: 20250119000001_fix_rls_recursion.sql

CREATE OR REPLACE FUNCTION my_function(...)
AS $$
BEGIN
  -- Uses is_admin_user() - dependency exists in earlier migration
  IF NOT is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
END;
$$;
```

---

## Data Migrations

### Safe Patterns

```sql
-- ✅ Use ON CONFLICT for inserts
INSERT INTO table_name (column1, column2)
SELECT column1, column2
FROM source_table
ON CONFLICT (unique_column) DO NOTHING;

-- ✅ Use conditional WHERE clauses
UPDATE table_name
SET column = value
WHERE condition
  AND column IS NULL; -- Only update if not already set

-- ✅ Use EXISTS checks before operations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM table_name WHERE condition) THEN
    -- Perform migration
  ELSE
    RAISE NOTICE 'No data to migrate - skipping';
  END IF;
END $$;
```

---

## Error Handling

### When to Use RAISE EXCEPTION

**Use `RAISE EXCEPTION` for:**
- Critical data integrity violations (e.g., NULL required fields)
- Invalid configuration that must be fixed
- Security violations

**Don't use `RAISE EXCEPTION` for:**
- Missing optional data (use `RAISE NOTICE` or `RAISE WARNING`)
- Validation checks on fresh databases (make them optional)
- Index existence checks (use `RAISE NOTICE`)

### Logging Levels

```sql
-- ✅ Informational (always safe)
RAISE NOTICE 'Migration completed successfully';

-- ✅ Warning (safe, but indicates potential issue)
RAISE WARNING 'No data found to migrate - this may be expected';

-- ⚠️ Exception (stops migration - use carefully)
RAISE EXCEPTION 'Critical error: %', error_message;
```

---

## Examples

### ✅ Good Migration

```sql
-- Add message_id column to files table
-- Safe for both fresh and existing databases

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_files_message_id 
ON files(message_id) 
WHERE message_id IS NOT NULL;

-- Migrate existing data (safe on empty table)
UPDATE files
SET message_id = (metadata->>'message_id')::uuid
WHERE metadata->>'message_id' IS NOT NULL
  AND message_id IS NULL
  AND (metadata->>'message_id')::uuid IS NOT NULL;

-- Log results (informational)
DO $$
DECLARE
  migrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM files
  WHERE message_id IS NOT NULL;
  
  RAISE NOTICE 'Migration complete. Files with message_id: %', migrated_count;
END $$;
```

### ❌ Bad Migration

```sql
-- ❌ BAD: Will fail if index doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_example') THEN
    RAISE EXCEPTION 'Index does not exist';
  END IF;
END $$;

-- ❌ BAD: Will fail on fresh database
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM tools) = 0 THEN
    RAISE EXCEPTION 'Tools table is empty';
  END IF;
END $$;

-- ❌ BAD: Will fail if column exists
ALTER TABLE users ADD COLUMN new_column TEXT;
```

---

## Summary Checklist

Before committing a migration, verify:

- [ ] Uses `IF EXISTS` / `IF NOT EXISTS` / `OR REPLACE` where appropriate
- [ ] Validation migrations are optional (skip on fresh database)
- [ ] Data migrations handle empty tables
- [ ] No `RAISE EXCEPTION` in validation blocks (use `RAISE NOTICE` or `RAISE WARNING`)
- [ ] Function dependencies exist in earlier migrations
- [ ] Tested on fresh database (`supabase db reset`)
- [ ] Tested on existing database (incremental update)
- [ ] Clear comments explaining purpose and dependencies
- [ ] Conditional migrations have proper checks and documentation

---

## References

- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL CREATE OR REPLACE](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgreSQL IF EXISTS](https://www.postgresql.org/docs/current/sql-droptable.html)

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `security/RULE.md` - RLS policy patterns and security considerations
- `workflow/RULE.md` - Development processes and testing workflows
- `architecture/RULE.md` - Database structure and organization patterns

**Rules that reference this rule:**
- `security/RULE.md` - References RLS policy patterns (which are often created in migrations)
- `workflow/RULE.md` - May reference migration testing as part of development workflow

