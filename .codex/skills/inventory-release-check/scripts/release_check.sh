#!/usr/bin/env bash
set -euo pipefail

printf "== Git Status ==\n"
git status --short || true

printf "\n== Route List (top 40) ==\n"
php artisan route:list --except-vendor | head -n 40 || true

printf "\n== Build ==\n"
npm run build

printf "\n== Risky Patterns ==\n"
rg -n "Artisan::call|Route::fallback|dd\(|console\.log\(" app routes resources || true

printf "\n== Potential Secret Files Tracked ==\n"
git ls-files '.env*' || true
