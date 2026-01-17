# Rules Index

Quick reference guide to all rules and their relationships.

## Rule Categories

### Code Style (`code-style/RULE.md`)
- Naming conventions
- Formatting standards
- Documentation requirements
- Code organization
- **Import ordering** (external first, then internal) - style concerns only
- **Styling scope standards** (always ask scope before implementing styling changes)
- **GTS linting** (default, with override option)
- **TypeScript strict mode** (required)
- **Complexity standards** (functions ≤ 10 cyclomatic, ≤ 15 cognitive, ≤ 100 lines)
- **Note:** Path aliases, import direction, and layer boundaries are defined in `architecture/RULE.md` (SSOT)

**Related to:** All other rules

---

### Architecture (`architecture/RULE.md`)
- Design principles
- **Project structure** (SSOT for folder organization)
- **Path aliases** (SSOT for `@/hooks/*`, `@/components/*`, etc. mappings)
- Patterns and practices
- Module organization
- Layer boundaries and import direction
- **Architecture documentation** (required maintenance)

**Related to:** code-style, testing, security, workflow

---

### Testing (`testing/RULE.md`)
- Test coverage requirements
- Testing patterns
- Test organization
- Quality standards

**Related to:** code-style, architecture, workflow

---

### Security (`security/RULE.md`)
- Authentication & authorization
- Input validation
- Data protection
- Vulnerability prevention

**Related to:** architecture, code-style, workflow

---

### Workflow (`workflow/RULE.md`)
- Code review process
- **Git workflow with changelog synchronization** (mandatory)
- **Semantic versioning** (required: MAJOR.MINOR.PATCH)
- **Commit message format** (version first, matches changelog)
- **Branch protection** (experimental/main/feature branches with verification)
- Development process
- PR standards
- Agent-specific behaviors
- **🚨 CRITICAL: PowerShell/Select-Object piping rules** (prevents IDE crashes)
- Deployment processes

**Related to:** All other rules (references them in review process)

---

### Cloud Functions (`cloud-functions/RULE.md`)
- **When to use Edge Functions** vs frontend logic (decision framework)
- Function organization by business capability
- Deployment model and fragility considerations
- Testing strategy and migration paths

**Related to:** architecture, workflow, security

---

### Database (`database/RULE.md`)
- Database migration best practices for Supabase/PostgreSQL
- Safe migration patterns (idempotent, handles fresh/existing databases)
- Testing migrations (fresh database and incremental updates)
- Error handling and logging patterns

**Related to:** security, workflow, architecture

---

### Debugging (`debugging/RULE.md`)
- Debugging strategies and logging practices
- Scientific Method Debugging process
- Issue analysis and flow reconstruction
- Reductive strategy for bugs and new features

**Related to:** workflow, testing, architecture

---

### Project-Specific (`project-specific/RULE.md`)
- Rate limiting patterns for Edge Functions
- Project-specific security implementations
- Implementation examples and checklists

**Related to:** security, cloud-functions, database

---

### File Placement (`file-placement/RULE.md`)
- **Validate file and folder placement before creation** (mandatory pre-creation check)
- Project structure validation using `projectStructure.config.js`
- Architecture compliance verification
- Guidance for correct file/folder locations

**Related to:** architecture, workflow

---

## Consistency Check Matrix

When modifying a rule, check these related rules:

| Rule | Check These Rules |
|------|-------------------|
| `code-style` | architecture, testing, workflow |
| `architecture` | code-style, testing, security, workflow, cloud-functions, database |
| `testing` | code-style, architecture, workflow, debugging |
| `security` | architecture, code-style, workflow, cloud-functions, database, project-specific |
| `workflow` | All rules (references them) |
| `cloud-functions` | architecture, workflow, security, project-specific |
| `database` | security, workflow, architecture |
| `debugging` | workflow, testing, architecture |
| `project-specific` | security, cloud-functions, database |
| `file-placement` | architecture, workflow |

## Adding a New Rule

1. Create folder: `rules/[category]/[rule-name]/`
2. Create `RULE.md` following the template
3. Add "Related Rules" section at the bottom
4. Update this INDEX.md
5. Update related rules to reference the new rule

