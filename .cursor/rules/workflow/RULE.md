---
description: "Development workflow, code review, and process standards"
alwaysApply: true
---

# Workflow Standards

Development workflows, code review standards, and process requirements. Includes agent-specific behaviors and corrections to compensate for default agent behavior.

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
- Functionality: Does it work as intended?
- Code Quality: Is it maintainable and readable?
- Performance: Are there obvious performance issues?
- Security: Are there security vulnerabilities?
- Testing: Is it adequately tested?

## Git Workflow

### Version Control Standards

#### Semantic Versioning
All projects must follow semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR (X.0.0): Breaking changes
  - Major version bumps require explicit user confirmation before proceeding
  - Ask: "This is a MAJOR version bump (breaking change). Do you want to proceed?"
  - Only proceed after explicit user confirmation
- MINOR (0.X.0): New features (backwards compatible)
- PATCH (0.0.X): Bug fixes (backwards compatible)
- One commit per released version: Each version release should be a single commit

#### Changelog Synchronization
Commits and changelog must be synchronized:
- Always add a new version entry at the top of changelog before committing
- Git commit message must match the changelog version heading
- Version number should be first in the commit message

#### Commit Messages
Format: `[VERSION] type: Feature/Change Title`

- Version number must be first (e.g., `[3.19.0] feat: User Profile Settings`)
- Use conventional commit format: `type: description`
- Commit message subject must exactly match changelog feature title (with type prefix)
- Commit body is required: Must include details about what changed
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

**Changelog Sections:**
Changelog entries use Keep-a-Changelog style sections:
- `### Added` - New features
- `### Changed` - Changes in existing functionality
- `### Deprecated` - Soon-to-be removed features
- `### Removed` - Removed features
- `### Fixed` - Bug fixes
- `### Security` - Security vulnerability fixes
- `### Documentation` - Documentation changes
- `### Tests` - Test-related changes
- `### Performance` - Performance improvements

**Changelog Update Requirements:**
- User-facing features: Required
- Bug fixes: Required
- Documentation: Required
- Internal refactoring: Optional (but commit must still be descriptive)
- Dependency updates: Optional

**Example Workflow:**
1. Update changelog: Add `## 3.19.0 - 2024-11-01` with feature description
2. Commit with matching message: `[3.19.0] feat: User Profile Settings`
3. Verify: Changelog title matches commit subject (minus version prefix)

#### Version Synchronization

When updating the changelog with a new version, update three locations to maintain consistency:

1. **Update `package.json`**: Change the `version` field to match the new changelog version
   - File: `package.json` (root level)
   - Ensures console output shows correct version when running `npm run dev`

2. **Update fallback version in UI**: Update the hardcoded fallback in ProfileMenu
   - File: `src/components/chat/TopBar/ProfileMenu.tsx`
   - Update the fallback value in `import.meta.env.VITE_APP_VERSION || 'X.Y.Z'`
   - Ensures users see the correct version in the Profile Menu

3. **Update changelog**: Add new entry at the top of `CHANGELOG.md` (root directory)

All three locations must use the same version number to maintain consistency across:
- NPM package version
- Console dev server output
- Browser UI display

### Branch Strategy

#### Project Branch Pattern

Project supports:
- `experimental` branch: Primary development branch for testing before production
- `main` branch: Production branch (protected)
- Feature branches (optional): Created from `experimental` for isolated feature work

**Workflow:**
- All code changes should be made on `experimental` branch or feature branches
- Test changes on `experimental` branch first
- Both `experimental` and `main` may share the same database
- Merge `experimental` → `main` after validation
- Feature branches merge to `experimental`, then `experimental` → `main`

#### Branch Protection

**Critical Rule: Development Branch Enforcement**

The AI must verify the current git branch before editing any code file.

##### Verification Process

1. Check the current branch at the start of code-related conversations
2. If unsure, ask: "Which branch are you currently on?"
3. Proceed only after confirming the branch

##### Branch-Specific Rules

- `experimental`: All code changes allowed (primary development branch)
- Feature branches: All code changes allowed (created from experimental)
- `main`: Code changes blocked (unless explicit emergency override)
- Other branches: Ask user before proceeding

##### When User is on Main Branch

If code changes are requested while on `main`:

Stop immediately and display warning:
- User is currently on the `main` branch
- Code changes should only be made on `experimental` or feature branches
- Please switch branches: `git checkout experimental`
- Once switched, proceed with requested changes

Do not make code changes until user confirms they've switched.

##### Exceptions

**Safe to Edit on Any Branch**

These files may be edited on any branch after user confirmation:
- Documentation files (`documentation/*.md`)
- Cursor rules (`.cursor/rules/*.md`)
- README files

**Emergency Main Branch Changes**

Only proceed with main branch code changes when:
1. User explicitly states "emergency fix on main"
2. User confirms with "yes, proceed on main"
3. User acknowledges the risk

##### Implementation Checklist

Before editing code files:
- [ ] Verify current branch (ask user if unsure)
- [ ] Confirm branch is `experimental`, a feature branch, OR user gave explicit override
- [ ] If on `main`, show warning and wait for branch switch
- [ ] Proceed with changes only after confirmation

##### Integration with Workflow

**During Development:**
- Start of session: "Which branch are you working on?"
- Before first code edit: Verify branch
- After user mentions testing: Confirm experimental branch
- Before deployment: Remind about branch-specific deploys

**During Git Operations:**
- Before providing commit instructions: Confirm correct branch
- When user requests merge: Verify experimental → main flow
- During changelog updates: Note which branch changes apply to

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
- Update changelog if changes are user-facing (features, fixes, docs)
- Create commit with version number first and matching changelog title
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
Never claim success without a user test:
- The user decides if an implementation is successful, not the agent
- Always wait for user confirmation before marking tasks as complete
- Avoid statements like "This should work" or "The implementation is complete"

### Reductive Strategy (Bugs and New Features)

**Always simplify first**: When fixing bugs, implementing new features, or refactoring, always first simplify and reduce code.

- Default approach: Try to achieve the result by removing or simplifying existing code
- Only add code when: Simplification failed OR user explicitly gave permission to add code
- Prefer removing code over adding code
- Applies to: Bug fixes, feature requests, refactoring, and performance improvements

For complete debugging strategy, see `debugging/RULE.md`.

### Branch Protection

See Branch Strategy section above for detailed branch protection rules and verification process.

### Commit and Push Workflow

**Automated Workflow:** See `.cursor/commands/finish2.md` for the automated finish command that implements this workflow.

#### Permission-Based Flow

1. **After completing changes**, the AI:
   - Summarizes what was changed
   - Shows the changelog entry that was added
   - Asks the user: "Are you ready to commit these changes?"

2. **User responds** with explicit confirmation or denial

3. **Only after user confirms**, the AI provides:
   - The exact git commands to run
   - Step-by-step instructions

4. **The user executes** the commands in their terminal

#### Critical Rules

- Never run `git commit`, `git push`, or any git command automatically
- Never assume the user wants to commit just because changes are complete
- Always ask "Would you like me to provide commit instructions?" or similar
- Always wait for explicit user confirmation
- Always require commit body - commit messages must include detailed body explaining changes

### Documentation Lookup
- When needing documentation info from a URL, visit it programmatically using the actual browser tool
- Don't rely on cached or outdated documentation
- Verify current documentation before implementing features

### Platform and Commands

**Environment:** Windows with PowerShell.

**Command Rules:**
- No Unix-style `&&` chaining
- No Unix-only flags like `rm -rf`
- Provide commands as separate lines, each run independently

### Shell/PowerShell Handling

**Critical - Select-Object Piping Issue:**

Never pipe directly to `Select-Object` without `Out-String` first. This triggers VS Code/Cursor network errors that crash the IDE environment.

**Wrong (Do Not Use - Triggers Network Error):**
- Piping directly to `Select-Object` without `Out-String` first

**Correct (Always Use One of These):**
- Option 1: Use `Out-String` before `Select-Object` (recommended)
- Option 2: Capture to variable first (also safe)
- Option 3: No output filtering (safest, but shows all output)

**Critical**: Always check `$LASTEXITCODE` after external commands to prevent Cursor crashes. PowerShell doesn't always propagate exit codes correctly, and Cursor crashes when it receives error output but thinks the command succeeded (exit code 0).

**Required Pattern:**
- Check `$LASTEXITCODE` (not `$?`) after commands
- Use `exit $LASTEXITCODE` to preserve original exit code
- Always check exit codes for: npm/node commands (lint, test, build), commands that might fail, commands with output filtering

### Environment Variables and Configuration

**Environment Variables:**
- Use `VITE_*` names for all client-side environment variables
- Access via `import.meta.env.VITE_*`
- Never commit real `.env` files containing secrets
  - Use `.env.example` for structure only if needed
  - Real values live in local environment and CI

**Supabase Environment Variables (Current):**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- Access in code: `import {supabase} from '../../config/supabase';`

**For Edge Functions (set in Supabase Dashboard):**
- `GAMMA_API_KEY` - Gamma API key for presentation generation
- Other secrets configured via Supabase Dashboard → Project Settings → Edge Functions → Secrets

**Other Environment Variables:**
- `VITE_OPENROUTER_API_KEY` - OpenRouter API key for chat completion
- `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key for TTS/STT

**Legacy Firebase Variables (may still be needed for hosting/deployment):**
- `VITE_FIREBASE_API_KEY` - Firebase API key (for hosting deployment)
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID (for hosting)
- `VITE_FIREBASE_APP_ID` - Firebase app ID (for hosting deployment)
- Note: Firebase variables are primarily used for Firebase Hosting deployment configuration. The app now uses Supabase for database, auth, and storage.

**Hidden Files:**
- Some files are not visible to the AI (for example `.env`)
- When an issue involves hidden files, the AI should:
  - Ask the user to confirm relevant values (without exposing full secrets), or
  - Ask the user to paste safe snippets (keys, not secrets)

**Server Restarts:**
- Explicitly mention when a restart is required, especially after:
  - Environment variable changes
  - Dependency or tooling changes
  - Vite config, tsconfig, or path alias changes
  - Backend or server configuration changes

## Deployment Process

### Cloud Functions Deployment
- When cloud functions have to be deployed (again) for changes to have effect, deploy them yourself
- Don't ask user to deploy unless there's a specific reason they need to do it
- Verify deployment was successful

### Pre-Deployment Linting
- Always run and pass the exact predeploy lint locally for the specific package before deployment
- Command: `npm --prefix functions run lint[:fix]`
- Fix all lints until clean:
  - max-len violations
  - JSDoc requirements
  - Unused variables
  - Escaping issues
- Never deploy with linting errors

## Examples

### Good Commit Message (with changelog sync)

**Changelog entry:**
- Version heading: `## 3.19.0 - 2024-11-01`
- Section: `### Added`
- Entry: User Authentication with JWT token-based authentication system

**Commit message:**
- Format: `[3.19.0] feat: User Authentication`
- Body includes: Implementation details, middleware updates, service changes, test coverage
- References: Closes #123

Note: Commit body is required and must include details about what changed. Version number is first, commit type and title match changelog exactly.

### Bad Commit Message
- Generic messages like "fix stuff" without version, type, or details

### Good PR Description
- Clear changes section listing what was added/modified
- Testing section describing test coverage
- Related issues section with ticket references

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
