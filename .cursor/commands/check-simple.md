# check-simple

Use this workflow for any feature request:

### Preparation Steps
1. Review current state: summarize relevant functionality, limitations, and context.
2. Identify expert role(s) needed, including cascading technical/architectural considerations.
3. Ask targeted questions (numbered 1, 2, 3) with example answers (A, B, C, other) that enable confident transition to implementation.

### After I answer the questions
Create an implementation plan in `/documentation/jobs/job_[jobname]` that:
- Prioritizes efficiency, maintainability, consistency, reuse
- Minimizes complexity; prefer existing patterns/dependencies
- Reviews current vs intended end state
- Includes pseudo-code sketches
- Identifies reusable components; for new ones: purpose, location (`file-placement/RULE.md`), reusability
- **Validates:** File placement (`projectStructure.config.js`), architecture (`architecture/RULE.md`), complexity (SSOT: `.eslintrc.json` lines 65-70)

Apply this workflow for every feature request.
