---
description: "Development workflow, code review, and process standards"
alwaysApply: true
---

# Workflow Standards

## Purpose

This rule defines development workflows, code review standards, and process requirements. It also includes agent-specific behaviors and corrections to compensate for default agent behavior.

## Code Review Process

### Review Checklist
- [ ] Changelog updated (if user-facing changes) and matches commit message
- [ ] Commit message includes version number first and matches changelog
- [ ] Code follows style guidelines (`code-style/RULE.md`)
- [ ] Architecture patterns are followed (`architecture/RULE.md`)
- [ ] Architecture documentation updated (if structural changes)
- [ ] Tests are included and passing (`testing/RULE.md`)
- [ ] Security considerations addressed (`security/RULE.md`)
- [ ] Documentation is updated
- [ ] No console.log or debug code left behind
- [ ] Linting passes (GTS or project-specified tool)

### Review Focus Areas
- **Functionality**: Does it work as intended?
- **Code Quality**: Is it maintainable and readable?
- **Performance**: Are there obvious performance issues?
- **Security**: Are there security vulnerabilities?
- **Testing**: Is it adequately tested?

## Git Workflow

### Version Control Standards

#### Semantic Versioning
- **REQUIRED**: All projects must follow semantic versioning (MAJOR.MINOR.PATCH)
- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backwards compatible)
- **PATCH** (0.0.X): Bug fixes (backwards compatible)

#### Changelog Synchronization
- **CRITICAL**: Commits and changelog must be synchronized
- **ALWAYS** add a new version entry at the top of changelog BEFORE committing
- The git commit message MUST match the changelog version heading
- Version number should be first in the commit message

#### Commit Messages
- **Format**: `[VERSION] type: Feature/Change Title`
- Version number must be first (e.g., `[3.19.0] feat: User Profile Settings`)
- Use conventional commit format: `type: description`
- Commit message subject must exactly match changelog feature title (with type prefix)
- Reference issue/ticket numbers when applicable
- Keep commits focused (one logical change per commit)

**Conventional Commit Types:**
- `feat:` - New feature (bumps MINOR version)
- `fix:` - Bug fix (bumps PATCH version)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature change)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates

**Changelog Update Requirements:**
- User-facing features: **REQUIRED**
- Bug fixes: **REQUIRED**
- Documentation: **REQUIRED**
- Internal refactoring: **OPTIONAL** (but commit must still be descriptive)
- Dependency updates: **OPTIONAL**

**Example Workflow:**
1. Update changelog: Add `## 3.19.0 - 2024-11-01` with feature description
2. Commit with matching message: `[3.19.0] feat: User Profile Settings`
3. Verify: Changelog title matches commit subject (minus version prefix)

### Branch Strategy

#### Common Branch Patterns
Projects may use different branch strategies based on their needs:

**Feature Branch Pattern** (Default):
- Use feature branches for new work
- Merge directly to `main`
- Keep branches up to date with main
- Delete branches after merging
- Use descriptive branch names

**Experimental Branch Pattern**:
- Use `experimental` branch for testing before merging to `main`
- Test changes on `experimental` branch first
- Both `experimental` and `main` may share the same database
- Merge `experimental` → `main` after validation

**Develop Branch Pattern**:
- Use `develop` branch as integration branch
- Feature branches merge to `develop`
- `develop` merges to `main` for releases
- Useful for projects with release cycles

**Branch Protection**:
- **NEVER** edit code on `main` branch without explicit user override
- Always verify current branch before making changes
- Use appropriate branch pattern for the project

### Pull Requests
- Keep PRs focused and reasonably sized
- Include clear description of changes
- Link related issues or tickets
- Request reviews from appropriate team members

## Development Process

### Before Starting Work
- Understand requirements clearly
- Check for existing solutions or patterns
- Consider edge cases and error handling
- Plan the approach before coding

### During Development
- Write tests alongside code (TDD when appropriate)
- Commit frequently with meaningful messages
- Refactor as you go (don't accumulate technical debt)
- Follow established patterns and conventions

### Before Submitting
- **Update changelog** if changes are user-facing (features, fixes, docs)
- **Create commit** with version number first and matching changelog title
- Run linters and fix all issues
- Run tests and ensure they pass
- Review your own code
- Update documentation if needed
- Verify changelog and commit message match

## Agent-Specific Behaviors

### Agent Role and Control
- The agent has complete control over the application codebase
- The user is the tester and product-owner who provides user stories and tasks
- The agent turns user stories into architecture, logic, and code implementation
- Always respect user decisions and wait for validation before claiming success

### Success Validation
- **CRITICAL**: Never claim success without a user test
- The user decides if an implementation is successful, not the agent
- Always wait for user confirmation before marking tasks as complete
- Avoid statements like "This should work" or "The implementation is complete"

### Bug Fixing Approach
- **Always simplify first**: When fixing a bug/issue, always first simplify and reduce code
- **Only add code when**: Simplification failed OR user explicitly gave permission to add code
- **Default approach**: Try to fix everything by reducing complexity
- Prefer removing code over adding code

### Branch Protection
- **NEVER** edit code on `main` branch without explicit user override
- **If unsure of branch**: ASK user before proceeding
- Always verify current branch before making changes
- Use feature branches for all development work

### Documentation Lookup
- When needing documentation info from a URL, visit it programmatically using the actual browser tool
- Don't rely on cached or outdated documentation
- Verify current documentation before implementing features

### Shell/PowerShell Handling

**CRITICAL**: Always check `$LASTEXITCODE` after external commands to prevent Cursor crashes. PowerShell doesn't always propagate exit codes correctly, and Cursor crashes when it receives error output but thinks the command succeeded (exit code 0).

**Required Pattern:**

```powershell
npm run lint; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

**Use `$LASTEXITCODE` (not `$?`)** - it reflects the actual process exit code, not PowerShell's error state.

**Common Patterns:**

```powershell
# Simple command
npm run build; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# With directory change
cd "path"; if ($?) { 
  npm run lint
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# With output filtering
cd "path"; if ($?) {
  npm run test 2>&1 | Select-Object -First 30
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# With special characters (Prettier/ESLint errors)
npm run lint 2>&1 | ForEach-Object { $_.ToString() } | Select-Object -First 50
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```

**Always check exit codes for:** npm/node commands (lint, test, build), commands that might fail, commands with output filtering.

**Preserve original exit code:** Use `exit $LASTEXITCODE` (not hardcoded `exit 1`).

### Environment Files
- **Note**: There may be env files in the repo that you might not be able to see
- Don't assume all environment variables are visible
- Ask user about environment configuration if needed
- Respect `.env` files and their restrictions

## Deployment Process

### Cloud Functions Deployment
- When cloud functions have to be deployed (again) for changes to have effect, deploy them yourself
- Don't ask user to deploy unless there's a specific reason they need to do it
- Verify deployment was successful

### Pre-Deployment Linting
- **Always** run and pass the exact predeploy lint locally for the specific package before deployment
- Command: `npm --prefix functions run lint[:fix]`
- Fix all lints until clean:
  - max-len violations
  - JSDoc requirements
  - Unused variables
  - Escaping issues
- Never deploy with linting errors

## Examples

### ✅ Good Commit Message (with changelog sync)

**Changelog entry:**
```markdown
## 3.19.0 - 2024-11-01
### Added
- **User Authentication**: Added JWT token-based authentication system
```

**Commit message:**
```
[3.19.0] feat: User Authentication

- Implement JWT token generation and validation
- Add authentication middleware
- Update user service to handle auth state
- Add tests for authentication flow

Closes #123
```

**Note**: Version number is first, commit type and title match changelog exactly.

### ❌ Bad Commit Message

```
fix stuff
```

### ✅ Good PR Description

```markdown
## Changes
- Added user authentication using JWT tokens
- Implemented login/logout functionality
- Added protected routes middleware

## Testing
- Unit tests for auth service
- Integration tests for auth flow
- Manual testing of login/logout

## Related Issues
Closes #123
```

---

## Related Rules

**When modifying this rule, check these rules for consistency:**

- `code-style/RULE.md` - Code review standards reference code style
- `architecture/RULE.md` - Review process may reference architecture
- `testing/RULE.md` - Review checklist includes testing requirements
- `security/RULE.md` - Review process includes security checks
- `cloud-functions/RULE.md` - Deployment processes reference cloud functions

**Rules that reference this rule:**
- All other rules may be referenced in code review processes
- `cloud-functions/RULE.md` - References deployment processes

