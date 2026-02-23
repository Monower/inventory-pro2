# Current Hotspots

Check these files first when permission behavior is inconsistent:

- `database/seeders/DatabaseSeeder.php`
- `database/seeders/PermissionSeeder.php`
- `database/seeders/RolePermissionSeeder.php`
- `routes/modules/*Routes.php`

Known risk pattern:
- Seeder introduces a permission name not used by route middleware.
