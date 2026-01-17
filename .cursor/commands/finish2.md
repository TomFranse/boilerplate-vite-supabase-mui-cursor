# finish

Complete the implementation by doing what you haven't done yet of these tasks: 
- remove temporary console logs
- remove instrumentation
- remove redundant/legacy code
- **If this was a debugging session:** Check if a new error pattern was discovered that should be added to `.cursor/commands/debug.md` § "Common Error Pattern Recognition". Add it if:
  - The root cause was non-obvious and took multiple iterations to find
  - A senior developer hint would have significantly accelerated the fix
  - The pattern is generalizable (not repo-specific)
  - Format: 2-4 bullet points max (symptom, common causes, key question, debug approach)
- (Optional) Check staged files before committing using staged validation commands:
  - `pnpm validate:structure:staged` - Check staged file structure
  - `pnpm arch:check:staged` - Check staged architecture compliance
- update changelog (fetch date if unsure of date) - see `rules/workflow/RULE.md` for Keep a Changelog format
- commit with proper message format (see commit message standards below)
- fix any issues found by pre-commit hook. NEVER adjust rules without explicit user request.
- check if architecture.md needs update
- push to experimental

## Commit Message Standards

**Format:** `[VERSION] type: Feature/Change Title`

**Requirements:**
- Version number must be first (e.g., `[3.19.0]`)
- Use conventional commit types: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`
- Commit message subject must match changelog feature title (with type prefix)
- **Commit body is REQUIRED** - must include details about what changed
- Reference issue/ticket numbers when applicable

**Example:**
```
[3.19.0] feat: User Profile Settings

- Implement user profile update functionality
- Add validation for profile fields
- Update user service to handle profile changes
- Add tests for profile update flow

Closes #123
```

**Note:** Commit message must match changelog entry. Husky pre-commit hook runs automatically (see `.husky/pre-commit` for SSOT). See `rules/workflow/RULE.md` for complete commit message standards and Keep a Changelog format details.

You have explicit access to use console commands for this task. 