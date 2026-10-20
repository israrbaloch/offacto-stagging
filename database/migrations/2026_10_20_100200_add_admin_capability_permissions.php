<?php

use App\Models\Permission;
use App\Models\Role;
use App\Support\AdminAccess;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $permissionIds = [];
        foreach (AdminAccess::all() as $name) {
            $permissionIds[] = Permission::query()->firstOrCreate(['name' => $name])->id;
        }

        $admin = Role::query()->where('name', 'admin')->first();
        if ($admin) {
            $admin->permissions()->syncWithoutDetaching($permissionIds);
        }

        foreach (AdminAccess::specialistRoles() as $roleName => $permissionNames) {
            $role = Role::query()->firstOrCreate(['name' => $roleName]);
            $ids = Permission::query()->whereIn('name', $permissionNames)->pluck('id');
            $role->permissions()->sync($ids);
        }
    }

    public function down(): void
    {
        foreach (array_keys(AdminAccess::specialistRoles()) as $roleName) {
            Role::query()->where('name', $roleName)->delete();
        }

        Permission::query()->whereIn('name', AdminAccess::all())->delete();
    }
};
