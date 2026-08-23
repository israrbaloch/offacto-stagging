<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'manage-users',
            'manage-companies',
            'view-reports',
            'manage-invoices',
            'manage-offers',
            'manage-services',
            'manage-customers',
            'manage-settings',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $staffRole = Role::where('name', 'staff')->first();

        if ($adminRole) {
            // Admin gets all permissions
            $adminRole->permissions()->sync(Permission::all());
        }

        if ($staffRole) {
            // Staff gets limited permissions
            $staffPermissions = Permission::whereIn('name', [
                'view-reports',
                'manage-invoices',
                'manage-offers',
                'manage-services',
                'manage-customers',
            ])->get();

            $staffRole->permissions()->sync($staffPermissions);
        }
    }
}
