<?php

namespace Tests\Support;

use App\Models\Company;
use App\Models\Language;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\AdminAccess;

trait InteractsWithAdmin
{
    protected function makeAdmin(array $attributes = [], ?array $permissions = null): User
    {
        $user = User::factory()->create(array_merge([
            'email_verified_at' => now(),
            'is_active' => true,
        ], $attributes));

        $permissionNames = $permissions ?? AdminAccess::all();
        $ids = [];
        foreach ($permissionNames as $name) {
            $ids[] = Permission::query()->firstOrCreate(['name' => $name])->id;
        }

        $role = Role::query()->firstOrCreate(['name' => 'admin']);
        $role->permissions()->syncWithoutDetaching($ids);
        $user->roles()->syncWithoutDetaching([$role->id]);
        $user->unsetRelation('roles');

        return $user;
    }

    protected function makeSpecialist(array $permissionNames): User
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $ids = [];
        foreach ($permissionNames as $name) {
            $ids[] = Permission::query()->firstOrCreate(['name' => $name])->id;
        }

        $role = Role::query()->firstOrCreate(['name' => 'admin_support']);
        $role->permissions()->sync($ids);
        $user->roles()->sync([$role->id]);
        $user->unsetRelation('roles');

        return $user;
    }

    protected function makeCompany(User $owner, array $overrides = []): Company
    {
        $language = Language::query()->firstOrCreate(
            ['code' => 'en'],
            ['name' => 'English'],
        );

        return Company::create(array_merge([
            'user_id' => $owner->id,
            'first_name' => 'Ada',
            'surname' => 'Owner',
            'language' => $language->id,
            'email' => 'company-'.uniqid().'@example.test',
            'phone' => '+32'.random_int(100000000, 999999999),
            'vat_number' => 'BE'.random_int(100000000, 999999999),
            'company_name' => 'Acme '.uniqid(),
            'street' => 'Main',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ], $overrides));
    }
}
