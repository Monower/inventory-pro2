## Skills
A skill is a set of local instructions stored in a `SKILL.md` file.

### Available skills
- inventory-laravel-module: Build and modify Inventory Pro modules across Laravel backend and Inertia React frontend. (file: .codex/skills/inventory-laravel-module/SKILL.md)
- inventory-permission-sync: Keep Spatie permission middleware, permission seeders, and role assignments consistent. (file: .codex/skills/inventory-permission-sync/SKILL.md)
- inventory-release-check: Run focused pre-release checks and risk scans for this repository. (file: .codex/skills/inventory-release-check/SKILL.md)

### How to use skills
- Discovery: The list above is the skills available in this repository.
- Trigger rules: If a user mentions a skill name explicitly (with `$SkillName` or plain text), use that skill for the turn.
- Automatic triggers:
  - Use `inventory-laravel-module` when the request is to add/edit a module, CRUD flow, model/controller/routes/pages integration, or full-stack feature work.
  - Use `inventory-permission-sync` when the request mentions roles, permissions, middleware access, seeders, or authorization mismatch.
  - Use `inventory-release-check` when the request is to scan/review readiness, check release risk, or run deployment sanity checks.
- Multiple skills: Use the minimal set that fully covers the request.
- Missing files: If a listed skill file is missing, state it briefly and continue with best-effort fallback.
