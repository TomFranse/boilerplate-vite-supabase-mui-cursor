#!/usr/bin/env pwsh
# ESLint runner for PowerShell
# Usage: ./scripts/lint-safe.ps1 [eslint-args...]

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$EslintArgs = @(".", "--max-warnings=0")
)

# Run ESLint and propagate exit code
pnpm eslint @EslintArgs
exit $LASTEXITCODE
