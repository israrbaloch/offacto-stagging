<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AddUser extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('12345678'),
        ]);

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->roles()->attach($adminRole);
        }

        // Create staff user
        $staff = User::create([
            'name' => 'Staff',
            'email' => 'staff@example.com',
            'password' => Hash::make('12345678'),
        ]);

        $staffRole = Role::where('name', 'staff')->first();
        if ($staffRole) {
            $staff->roles()->attach($staffRole);
        }
    }
}
