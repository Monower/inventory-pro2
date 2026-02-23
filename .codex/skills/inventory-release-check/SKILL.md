---
name: inventory-release-check
description: Run focused pre-release checks for this repository, including route surface review, frontend build, risky endpoint detection, and configuration hygiene. Use when preparing deployment, reviewing merges, or auditing project health.
---

# Inventory Release Check

## Overview
Run repeatable checks that catch common release blockers in this Laravel + Inertia project.

## Workflow
1. Collect git status and changed files.
2. Verify route surface and middleware behavior.
3. Build frontend assets.
4. Scan for risky patterns (public maintenance routes, debug leftovers, duplicated component paths).
5. Summarize blockers versus warnings.

## Required Checks
- `php artisan route:list --except-vendor`
- `npm run build`
- `rg -n "Artisan::call|Route::fallback|dd\(|console\.log\(" app routes resources`

## Optional Checks
- Run `scripts/release_check.sh` for a single command summary.
- Inspect `bootstrap/cache/routes-v7.php` if routes appear stale.
- Verify no secrets are tracked (`.env.live`, key material, tokens).

## References
- Read `references/release-report-template.md` to format scan output.
- Read `references/risk-catalog.md` for severity guidelines.
