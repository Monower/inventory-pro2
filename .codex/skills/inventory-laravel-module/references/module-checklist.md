# Module Checklist

1. Add or update route file in `routes/modules/`.
2. Verify route file is required by `routes/web.php`.
3. Ensure middleware includes both `auth` and proper `permission:*`.
4. Ensure controller methods match routes.
5. Ensure model fillable fields and relationships support new fields.
6. Ensure migration changes are present when schema changes.
7. Ensure Inertia pages resolve from `resources/js/Pages/`.
8. Run `php artisan route:list --except-vendor`.
9. Run `npm run build`.
