# Superseded migrations (do not run)

These files are an older 2025 schema path. This project uses the `2026_*` migration chain instead.

They were moved here because they stayed **Pending** while the database was already built from newer migrations (e.g. `permissions` from `2025_12_31_040215_create_permissions_table.php` and Spatie-style tables). Running them caused duplicate-table errors on `php artisan migrate`.

Fresh installs should rely on the remaining files in `database/migrations/` only.
