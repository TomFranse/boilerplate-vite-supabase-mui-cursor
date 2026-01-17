# debug

# debug

Use **Scientific Method Debugging** 
The user does **not** edit code. The user only:
- Performs actions in the app.  
- Filters console logs if needed
- Copies and pastes console logs.  
- Performs actions in external dashboards (e.g. Supabase).  

You must never claim the issue is fixed; only the user decides when the issue is resolved.

---

### 1. Expected Input
Accept any of:
- Error message + stack trace  
- Console output  
- Description of what the user did  
- Mention of external systems involved  

If information is missing, proceed with assumptions and state them.

---

### 2. Component Nesting & Structure Analysis (React/UI Issues)
For UI/React issues, **always** analyze component nesting first, as nesting issues are often the root cause:

1. List all components/divs in which the problematic component is nested (full hierarchy).
2. List all properties being passed down through the component tree (prop drilling analysis).
3. Identify potential culprits:
   - CSS inheritance/overrides from parent components
   - Global styles affecting layout context (check body, html, #root for display: flex/grid that changes layout mode)
   - Overflow/stacking context issues (any element with overflow ≠ visible creates new stacking context)
   - Prop type mismatches or undefined props
   - Context providers affecting the component
   - Z-index/positioning conflicts from nesting
4. Form a hypothesis about which nesting level or prop is causing the issue.

This structural analysis informs the event chain reconstruction and helps identify if the issue is architectural rather than behavioral.

---

### 3. Event Chain Reconstruction
For each issue:
1. Reconstruct the chain from user action → app behavior → API calls/side effects → failure point.  
2. Present as a numbered list.  
3. Identify the most suspicious link.

All diagnostic steps must map back to **specific links in this chain**.

---

### 4. Hypotheses (Scientific Method)
For each issue propose 2–3 hypotheses:
- Each predicts **specific observable outcomes** the user can capture.  
- Each includes a **falsification condition**.  
- At least one involves an external configuration cause.  
- Each hypothesis must map to a **specific step** in the event chain.

Hypotheses must be designed so that logs or observations can **decide between them**.

---
### 5. Console log changes
- All hypotheseses must be verifyable by the user by simply performing an action and sharing the (filtered) console log output. 
- Console logs should include all possibly needed information for hypothesis falsification/verification.
- For API calls, raw API input an output can be needed. If so, log that to the console (take simple security measures to avoid exposing secrets)
---

### 6. Unified Diagnostic Steps (Single Ordered List)
Provide **one integrated numbered list** of user actions.  
These may include in-app interactions, devtools checks, network observations, or dashboard inspections.

Each step must:
- Correspond to a **specific location** in the event chain.  
- Clearly state **what observation supports or refutes each hypothesis**.  
- Aim to **cut the search space in half** with each action.  
- Indicate precisely what the user should copy/paste back.

Avoid category labels; all steps belong to one unified list.

---

### 7. Iterative Evidence Loop
When the user returns with logs or data:
1. Update the event chain using the new evidence.  
2. Mark each hypothesis as **supported**, **refuted**, or **uncertain**, and briefly **explain why**.  
3. Form a smaller, more precise hypothesis set.  
4. Provide the next unified action list.

Repeat until only the user declares the issue resolved.

---

### 8. External Configuration Awareness
Always include a configuration-based hypothesis when errors involve:
- Auth/permissions  
- RLS policies  
- API keys, tokens, or service URLs  
- Environment variable mismatches  
- Rate limits, quotas  
- Dev vs prod differences  

Provide specific checks and exact values the user should verify.

---

### 9. Common Error Pattern Recognition
When symptoms match known patterns, prioritize these hypotheses first:

**React "Maximum update depth exceeded":**
- Almost always: an object (not primitive) in a useCallback/useEffect dependency array
- Check: useMutation/useQuery return objects (unstable), Context values (unmemoized), inline objects
- Key question: "Is a callback being passed to Context via setState?" (classic loop pattern)
- Debug approach: Log which dependency actually changed using refs, don't guess

**N8N Webhook "Unused Respond to Webhook node found" (500 error):**
- Symptom: Webhook returns 500 with message "Unused Respond to Webhook node found in the workflow"
- Root cause: Webhook node Response Mode is set to auto-respond (default) but a Respond to Webhook node exists downstream
- Key question: "Is the Webhook node's Response Mode set to 'Using Respond to Webhook node'?"
- Debug approach: Check N8N workflow configuration, not code - verify Response Mode setting in Webhook node (N8N v1.114+ requires explicit configuration)

**Add other patterns here as they're discovered.**

---

### 10. Output Structure for Each Response
1. Quick Summary  
2. Component Nesting Analysis (if UI/React issue)
3. Event Chain  
4. Pattern Match Check (does this match a known pattern from §9?)
5. Hypotheses (with predictions + falsification conditions)  
6. Console log changes to verify/falsify all hypotheses
7. Unified Action Steps and code changes
8. What to Return  
9. Next Narrowing Step  
