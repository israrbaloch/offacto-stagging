<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\AdminAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserCreateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (AdminAccess::all() as $name) {
            Permission::query()->firstOrCreate(['name' => $name]);
        }

        $adminRole = Role::query()->firstOrCreate(['name' => 'admin']);
        $adminRole->permissions()->syncWithoutDetaching(Permission::pluck('id'));

        foreach (AdminAccess::specialistRoles() as $roleName => $permissionNames) {
            $role = Role::query()->firstOrCreate(['name' => $roleName]);
            $ids = Permission::query()->whereIn('name', $permissionNames)->pluck('id');
            $role->permissions()->sync($ids);
        }
    }

    public function test_admin_can_create_support_specialist_user(): void
    {
        $admin = User::factory()->create(['email_verified_at' => now(), 'is_active' => true]);
        $adminRole = Role::query()->where('name', 'admin')->first();
        $admin->roles()->sync([$adminRole->id]);

        $response = $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Support Agent',
            'email' => 'support@example.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'mark_email_verified' => true,
            'is_active' => true,
            'platform_access' => 'specialist',
            'admin_permissions' => [AdminAccess::SUPPORT],
        ]);

        $response->assertRedirect();

        $user = User::query()->where('email', 'support@example.test')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('admin_support'));
        $this->assertTrue($user->hasPermission(AdminAccess::SUPPORT));
        $this->assertTrue(AdminAccess::canAccessAdminArea($user));
    }
}
