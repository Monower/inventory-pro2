---
name: inventory-laravel-module
description: Build and modify Inventory Pro modules across Laravel backend and Inertia React frontend. Use when adding or changing CRUD features, controllers, routes/modules/*.php files, migrations/models, permissions, or resources/js/Pages entries in this repository.
---

# Inventory Laravel Module

## Overview
Implement module features end-to-end in this repository with consistent route, controller, model, and Inertia page structure.

## Workflow
1. Identify the module scope and naming.
2. Read matching files in `routes/modules/`, `app/Http/Controllers/`, `app/Models/`, `resources/js/Pages/`, and `database/migrations/`.
3. Add or modify backend behavior first.
4. Add or modify frontend Inertia pages and shared components.
5. Align permission middleware and seeder permission names.
6. Run lightweight verification commands before finalizing.

## Backend Pattern
- Keep module routes in `routes/modules/<Module>Routes.php`.
- Register module route files from `routes/web.php`.
- Protect module routes with `auth` and `permission:*` middleware.
- Keep controller actions predictable: `index`, `create`, `store`, `edit`, `update`, `destroy`, and optional `show`.
- Use form validation rules in controllers or Request classes.
- Update related models and migrations together when fields change.

## Frontend Pattern
- Use `resources/js/Pages/<Module>/` for pages.
- Keep page names aligned to route usage (`Index.jsx`, `Create.jsx`, `Edit.jsx`, or project-consistent lowercase variants).
- Reuse shared components from `resources/js/Components/`.
- Keep imports aligned with the project alias config (`@/*` from `jsconfig.json`).

## Verification
Run these checks after edits:
- `php artisan route:list --except-vendor`
- `npm run build`
- Optional targeted checks with `scripts/module_check.sh <module-slug>`

## References
- Read `references/file-map.md` before touching cross-layer features.
- Read `references/module-checklist.md` before final validation.
