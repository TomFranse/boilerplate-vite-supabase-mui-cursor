# Rule Improvement
**Task:** Improve the appended rule based on the following logic and quality standards.

## Phase 1: Analysis
Analyze the provided rule text and rate it on a scale of 1-5 for each of the following Quality Standards. explicitly noting any violations.

### Quality Standards (The Strict Criteria)
1.  **Single Source of Truth (SSOT) & DRY:**
    * Does this rule duplicate logic found in standard coding practices or other known rule files?
    * *Requirement:* If a concept is defined elsewhere, remove the definition and reference the primary source (e.g., "Refer to `formatting_rules.md`").
2.  **Separation of Concerns:**
    * Does this rule focus on a single logic domain?
    * *Requirement:* Split complex rules into distinct, atomic instructions.
3.  **Abstraction Level (No Code Snippets):**
    * Does the rule contain specific code implementations?
    * *Requirement:* Remove code snippets. Replace them with abstract, natural language descriptions of the pattern or behavior (e.g., instead of showing a React component, say "Use functional components with typed props").
4.  **Conditional Structure (If/Then):**
    * Is the rule written in prose or narrative format?
    * *Requirement:* Rephrase into strict conditional logic: "IF [Context/Trigger] THEN [Action/Constraint]."
5.  **Imperative Adherence:**
    * Is the language passive or polite?
    * *Requirement:* Use "Must," "Strictly," "Always," and "Never."
6.  **Positive Constraint Framing:**
    * Does it only say what *not* to do?
    * *Requirement:* If a negative constraint is present, pair it with the correct positive alternative.

## Phase 2: Optimization
Rewrite the rule applying the improvements identified above.
* **Format:** Use strict Markdown with headers and bullet points.
* **Structure:** Group related logic under clear headings.
* **Logic:** Use the "If... Then..." syntax for all behavioral instructions.
* **Linking:** If the rule relates to other common files (e.g., specific framework rules), add a "See Also" or "Requires" reference line instead of explaining the external concept.

---
[PASTE YOUR RULE TEXT HERE]