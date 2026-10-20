<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\SupportAccessRequest;
use App\Support\AdminAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class UserSuspendAndAccessTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    public function test_suspended_user_loses_access_on_next_request(): void
    {
        $admin = $this->makeAdmin();
        $target = $this->makeAdmin(['email' => 'other-admin@example.test']);

        $this->actingAs($admin)
            ->post("/admin/users/{$target->id}/toggle-active")
            ->assertRedirect();

        $this->assertFalse($target->fresh()->isActive());

        $this->actingAs($target->fresh())
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_workspace_entry_requires_approved_access_when_policy_enabled(): void
    {
        SiteSetting::set('sup_require_access_approval', '1', 'boolean');
        $admin = $this->makeAdmin();
        $owner = \App\Models\User::factory()->create();
        $company = $this->makeCompany($owner);

        $this->actingAs($admin)
            ->from('/admin/companies/'.$company->id)
            ->post("/admin/companies/{$company->id}/workspace")
            ->assertSessionHasErrors('workspace');

        $access = SupportAccessRequest::create([
            'reference' => 'ACC-1',
            'company_id' => $company->id,
            'requested_by_user_id' => $admin->id,
            'reason' => 'Ticket review',
            'scope' => 'read_only_context',
            'status' => 'approved',
            'approved_at' => now(),
            'expires_at' => now()->addHours(8),
        ]);

        $this->actingAs($admin)
            ->post("/admin/companies/{$company->id}/workspace")
            ->assertRedirect(route('dashboard'));

        $access->update(['expires_at' => now()->subMinute()]);

        $this->actingAs($admin)
            ->from('/admin/companies/'.$company->id)
            ->post("/admin/companies/{$company->id}/workspace")
            ->assertSessionHasErrors('workspace');
    }

    public function test_specialist_without_governance_cannot_retry_jobs(): void
    {
        $support = $this->makeSpecialist([AdminAccess::SUPPORT]);

        $this->actingAs($support)
            ->get('/admin')
            ->assertOk();

        $this->actingAs($support)
            ->get('/admin/governance')
            ->assertForbidden();
    }
}
