---
description: "Testing standards, patterns, and quality requirements"
alwaysApply: true
---

# Testing Standards

## Purpose

This rule defines testing requirements, patterns, and quality standards for ensuring code reliability.

## Test Coverage

### Minimum Requirements
- Aim for 80%+ code coverage on critical paths
- Test all public APIs and exported functions
- Cover edge cases and error conditions

### What to Test
- Business logic and calculations
- User interactions and workflows
- Error handling and edge cases
- Integration points between modules

### What Not to Test
- Third-party library functionality
- Trivial getters/setters without logic
- Implementation details (test behavior, not implementation)

## Test Organization

### File Structure
- Mirror source file structure in test directory
- Use descriptive test file names: `[component].test.ts` or `[component].spec.ts`
- Group related tests using `describe` blocks

### Test Naming
- Use descriptive test names that explain what is being tested
- Follow pattern: "should [expected behavior] when [condition]"
- Avoid generic names like "test1" or "works"

## Testing Patterns

### Unit Tests
- Test individual functions/components in isolation
- Mock external dependencies
- Use test doubles (mocks, stubs, spies) appropriately

### Integration Tests
- Test interactions between modules
- Use real implementations where possible
- Test data flow through the system

### Test Data
- Use factories or builders for test data
- Keep test data minimal and focused
- Avoid hardcoded values that may change

## Examples

### ✅ Good Example

```typescript
describe("calculateTotalPrice", () => {
  it("should return price with tax when given valid inputs", () => {
    const result = calculateTotalPrice(100, 0.20);
    expect(result).toBe(120);
  });
  
  it("should throw error when price is negative", () => {
    expect(() => calculateTotalPrice(-10, 0.20)).toThrow(
      "Price cannot be negative"
    );
  });
  
  it("should handle zero tax rate", () => {
    const result = calculateTotalPrice(100, 0);
    expect(result).toBe(100);
  });
});
```

### ❌ Bad Example

```typescript
// Bad: unclear test names, no edge cases, poor organization
describe("test", () => {
  it("works", () => {
    expect(calculateTotalPrice(100, 0.20)).toBe(120);
  });
});
```

## Test Quality

### Readability
- Tests should read like documentation
- Use clear setup, execution, and assertion phases
- Avoid complex test logic

### Maintainability
- Keep tests independent (no shared state)
- Use beforeEach/afterEach for common setup
- Refactor test code like production code

### Performance
- Keep tests fast (unit tests should run in milliseconds)
- Use appropriate test types for different scenarios
- Avoid unnecessary async operations

## Edge Functions Testing

### Special Considerations

**Edge Functions have unique testing constraints:**

- **No staging environment**: Edge Functions deploy once and affect both experimental and main branches
- **Manual testing only**: No automated testing or rollback for functions
- **High impact**: Bugs in Edge Functions impact the entire app across all branches
- **Deployment**: Deploy via `supabase functions deploy <function-name>`

**Testing Strategy:**

- Consider impact before adding new functions
- Test thoroughly in development before deployment
- Use manual testing workflows
- Document test procedures for each function

**Frontend Logic Testing** (preferred when possible):

- Test on experimental branch first
- User testing before merging to main
- Easy rollback if issues found
- Better isolation and testability

For Edge Functions architecture and when to use them, see `cloud-functions/RULE.md`.

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `code-style/RULE.md` - Code style standards for test files
- `architecture/RULE.md` - Testing patterns that depend on architecture
- `workflow/RULE.md` - Code review standards for tests
- `cloud-functions/RULE.md` - Edge Functions testing considerations

**SSOT Status:**
- This rule is the **SSOT** for testing standards, patterns, and quality requirements
- Other rules reference this rule for testing guidelines (e.g., `cloud-functions/RULE.md` references testing strategy)

**Rules that reference this rule:**
- `architecture/RULE.md` - May reference testability requirements
- `cloud-functions/RULE.md` - References this rule as SSOT for testing standards

