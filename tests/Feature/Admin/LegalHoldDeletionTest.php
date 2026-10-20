<?php

namespace Tests\Feature\Admin;

use App\Models\CompanyDeletionRequest;
use App\Models\ComplianceLegalHold;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class LegalHoldDeletionTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    public function test_active_hold_blocks_deletion_completion(): void
    {
        $admin = $this->makeAdmin();
        $company = $this->makeCompany($admin);
        $hold = ComplianceLegalHold::create([
            'reference' => 'HOLD-1',
            'company_id' => $company->id,
            'title' => 'Litigation',
            'scope_description' => 'Keep company records',
            'status' => 'active',
            'placed_at' => now(),
        ]);
        $request = CompanyDeletionRequest::create([
            'company_id' => $company->id,
            'requested_by' => $admin->id,
            'status' => 'pending',
            'reason' => 'Customer request',
            'legal_hold' => false,
        ]);

        $this->actingAs($admin)
            ->from('/admin/companies/'.$company->id)
            ->patch("/admin/companies/{$company->id}/deletion-requests/{$request->id}", [
                'status' => 'completed',
            ])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseHas('companies', [
            'id' => $company->id,
            'company_name' => $company->company_name,
        ]);
        $this->assertNull($request->fresh()->anonymized_at);

        $hold->update(['status' => 'released', 'released_at' => now()]);

        $this->actingAs($admin)
            ->patch("/admin/companies/{$company->id}/deletion-requests/{$request->id}", [
                'status' => 'completed',
            ])
            ->assertSessionHasNoErrors();

        $this->assertFalse((bool) $company->fresh()->is_active);
    }

    public function test_unscoped_hold_blocks_any_company_deletion(): void
    {
        $admin = $this->makeAdmin();
        $company = $this->makeCompany($admin);
        ComplianceLegalHold::create([
            'reference' => 'HOLD-ALL',
            'company_id' => null,
            'title' => 'Platform hold',
            'scope_description' => 'All tenants',
            'status' => 'active',
            'placed_at' => now(),
        ]);
        $request = CompanyDeletionRequest::create([
            'company_id' => $company->id,
            'requested_by' => $admin->id,
            'status' => 'pending',
            'reason' => 'Customer request',
            'legal_hold' => false,
        ]);

        $this->actingAs($admin)
            ->patch("/admin/companies/{$company->id}/deletion-requests/{$request->id}", [
                'status' => 'completed',
            ])
            ->assertSessionHasErrors('status');
    }
}
