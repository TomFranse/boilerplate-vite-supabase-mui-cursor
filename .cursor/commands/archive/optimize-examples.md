# Optimize Command Examples

This file contains detailed examples for the `optimize` command. See [optimize2.md](./optimize2.md) for the main command documentation.

---

## Example 1: Multi-Level Optimization

```
═══════════════════════════════════════════════════════════════════
HOTSPOT #1: calculatePricing()
Location: `src/features/billing/utils/pricing.ts:45:180`
Churn: 12 commits, 3 contributors in last 30 days
Dependencies: 8 files import this
═══════════════════════════════════════════════════════════════════

LEVEL 1 - DESIGN:
├── Status: OK
├── Finding: Feature is actively used and necessary
└── Options:
    [1D] Keep design ✓

LEVEL 2 - APPROACH:
├── Status: Issue Found ⚠️
├── Finding: Currently iterates through all products for each line item (O(n²))
│            when a Map lookup would be O(n)
└── Options:
    [2A] Rewrite with Map-based lookup - eliminates nested loops
    [2B] Pre-index products in calling code - shifts responsibility
    [2D] Keep approach

LEVEL 3 - EFFICIENCY:
├── Status: Issue Found ⚠️
├── Finding: Recalculates tax rates on every call, could be memoized
└── Options:
    [3A] Add memoization for tax rate lookup
    [3E] Keep as-is (will be addressed by 2A)

LEVEL 4 - COMPLEXITY:
├── Status: Issue Found ⚠️
├── Metrics:
│   ├── Cyclomatic: 18 (threshold: 10) ⚠️
│   ├── Cognitive: 24 (threshold: 15) ⚠️
│   ├── Nesting: 5 (threshold: 4) ⚠️
│   ├── Lines: 135 (threshold: 100) ⚠️
│   ├── Statements: 45 (threshold: 20) ⚠️
│   └── Params: 4 (threshold: 5) ✓
├── Proportionality Check:
│   ├── Has 3+ call sites? Yes (8 files) ✓
│   ├── Cognitive complexity high? Yes (24)
│   ├── Extraction improves readability? Yes
│   └── Function cohesive? No (does pricing + discounts + tax)
└── Options:
    [4A] Extract methods: calculateLineItem(), applyDiscount(), calculateTax()
    [4B] Simplify conditionals with guard clauses
    [4E] Accept complexity

───────────────────────────────────────────────────────────────────
RECOMMENDED ACTION: 2A (Rewrite with Map-based lookup)
Rationale: Fixing Level 2 will require restructuring that likely addresses
           Level 3 (memoization may become unnecessary) and Level 4
           (simpler algorithm = simpler code)
───────────────────────────────────────────────────────────────────

Please choose options for each level (e.g., "1D 2A 3E 4E"):
> USER: "1D 2A 3E 4A"

───────────────────────────────────────────────────────────────────
EXECUTION PLAN:
1. Write tests for calculatePricing() current behavior
2. Rewrite using Map-based product lookup (2A)
3. In new implementation, also extract helper methods (4A)
4. Skip explicit memoization (3E) - new approach eliminates need
5. Verify tests pass
6. Verify complexity metrics meet thresholds
7. Commit changes
───────────────────────────────────────────────────────────────────

Proceeding with execution...
```

---

## Example 2: When to Accept Complexity (4E)

```
═══════════════════════════════════════════════════════════════════
HOTSPOT #2: calculateSlashHorizontalPosition()
Location: `src/shared/utils/slashPositionCalculator.ts:42:114`
Churn: 1 commit, 1 contributor in last 30 days
Dependencies: 1 file imports this
═══════════════════════════════════════════════════════════════════

LEVEL 1 - DESIGN:
├── Status: OK
├── Finding: Feature is necessary for quick prompts dropdown positioning
└── Options:
    [1D] Keep design ✓

LEVEL 2 - APPROACH:
├── Status: OK
├── Finding: Mirror element technique is appropriate for text measurement
└── Options:
    [2D] Keep approach ✓

LEVEL 3 - EFFICIENCY:
├── Status: OK
├── Finding: Mirror element is already cached
└── Options:
    [3E] Keep as-is ✓

LEVEL 4 - COMPLEXITY:
├── Status: Issue Found ⚠️
├── Metrics:
│   ├── Cyclomatic: 5 (threshold: 10) ✓
│   ├── Cognitive: 8 (threshold: 15) ✓
│   ├── Nesting: 1 (threshold: 4) ✓
│   ├── Lines: 72 (threshold: 100) ✓
│   ├── Statements: 37 (threshold: 20) ⚠️
│   └── Params: 5 (threshold: 5) ⚠️
├── Proportionality Check:
│   ├── Has 3+ call sites? No (1 file) ❌ Rule of Three NOT met
│   ├── Cognitive complexity high? No (8)
│   ├── Extraction improves readability? No (would scatter logic)
│   └── Function cohesive? Yes (single purpose: calculate position)
└── Options:
    [4A] Extract methods - NOT RECOMMENDED (<3 call sites, cohesive)
    [4E] Accept complexity [cohesive][single-use][verbose-ops] ✓

───────────────────────────────────────────────────────────────────
RECOMMENDED ACTION: 1D 2D 3E 4E (Accept all, no changes needed)
Rationale: High statement count (37) is from verbose but necessary
           style copying operations. Function is cohesive, single-use,
           and readable. Rule of Three NOT met (<3 call sites).
           Extraction would create indirection without benefit.
           The cure would be worse than the disease.
───────────────────────────────────────────────────────────────────
```
