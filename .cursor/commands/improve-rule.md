# Rule Improvement
**Task:** Improve the appended rule using these quality standards.

## Quality Standards

1. **Brevity & Signal-to-Noise Ratio:**
   - Remove filler words, unnecessary qualifications, and verbose phrasing.
   - Prefer direct statements over conditional syntax unless context-dependent behavior is required.
   - Example: "Use functional components" not "IF writing a component THEN use functional style."

2. **Single Source of Truth (SSOT) & DRY:**
   - Remove duplicated logic from standard practices or other rule files.
   - Reference primary sources instead of redefining concepts (e.g., "Refer to `formatting_rules.md`").

3. **Separation of Concerns:**
   - Focus on a single logic domain.
   - Split complex rules into distinct, atomic instructions.

4. **Abstraction Level:**
   - Remove code snippets and specific implementations.
   - Use abstract, natural language descriptions of patterns or behaviors.
   - Example: "Use functional components with typed props" not a React component example.

5. **Conditional Structure:**
   - Use "IF [Context/Trigger] THEN [Action]" only when the instruction depends on context or conditions.
   - Use direct statements for universal rules.
   - Avoid forcing conditional syntax onto simple, always-applicable rules.

6. **Imperative Language:**
   - Use direct, active voice.
   - Reserve "Must," "Strictly," "Always," "Never" for truly critical constraints.
   - Avoid overusing emphatic language that dilutes importance.

7. **Positive Constraint Framing:**
   - Pair negative constraints with positive alternatives.
   - Prefer stating what to do over what not to do.

## Rewrite Instructions

Apply the quality standards above to rewrite the rule:

- **Format:** Markdown with clear headers and bullet points.
- **Structure:** Group related logic under clear headings.
- **Logic:** Use conditional syntax only when context-dependent; otherwise use direct statements.
- **Linking:** Reference related files instead of explaining external concepts (e.g., "See Also: `framework_rules.md`").

---
[PASTE YOUR RULE TEXT HERE]
