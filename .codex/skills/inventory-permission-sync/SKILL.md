---
name: inventory-permission-sync
description: Keep Spatie permission middleware, permission seeders, and role assignments consistent for this Laravel project. Use when adding routes, changing permission names, editing seeders, or diagnosing permission denied behavior.
---

# Inventory Permission Sync

## Overview
Align permissions across route middleware and seeders so authorization behavior is deterministic and maintainable.

## Workflow
1. Read route middleware declarations under `routes/modules/`.
2. Extract all `permission:*` strings from routes.
3. Verify every route permission exists in `database/seeders/PermissionSeeder.php`.
4. Remove mismatched or duplicate permission names across seeders.
5. Ensure role seeding grants valid permission names.
6. Rebuild permission cache after seeding in runtime environments.

## Rules
- Use one naming convention only: `<action> <resource>` in singular form (example: `edit user`).
- Avoid introducing plural variants for the same resource (example: do not mix `edit user` and `edit users`).
- Keep permission names in routes and seeders byte-for-byte identical.
- Keep route middleware explicit; do not rely on implicit role-only checks for module CRUD.

## Verification
- Run `rg -n "permission:" routes/modules`.
- Compare output with permission arrays in seeders.
- Run role/permission seeders in non-production before release.

## References
- Read `references/permission-patterns.md` for naming conventions.
- Read `references/current-hotspots.md` for known mismatch areas in this repository.
