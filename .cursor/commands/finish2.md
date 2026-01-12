# finish

Complete the implementation by doing what you haven't done yet of these tasks: 
- remove temporary console logs
- remove instrumentation
- remove redundant/legacy code
- commit. The precommit will execute: 
    pnpm lint-staged

    # Run tests (currently placeholder, will run real tests when configured)
    pnpm test

    # Run type checking (fast, catches TypeScript errors)
    echo "Running type check..."
    pnpm type-check

    # Run full architecture validation
    echo "Running architecture validation..."
    pnpm validate:structure
    pnpm arch:check
- fix any issues. NEVER adjust rules without explicit user request.
- update changelog (fetch date if unsure of date), 
- check if architecture.md needs update, 
- push to experimental

You have explicit access to use console commands for this task. 