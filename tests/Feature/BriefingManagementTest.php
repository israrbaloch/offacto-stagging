<?php

namespace Tests\Feature;

use App\Models\Briefing;
use App\Models\Company;
use App\Models\Language;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BriefingManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Language::query()->create(['name' => 'English', 'code' => 'en']);
    }

    public function test_briefing_can_be_duplicated(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'first_name' => 'A',
            'surname' => 'B',
            'language' => Language::first()->id,
            'email' => 'co@example.test',
            'phone' => '+32000000001',
            'vat_number' => 'BE0123',
            'company_name' => 'Co',
            'street' => 'S',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ]);
        $user->setActiveCompanyId($company->id);

        $briefing = Briefing::create([
            'company_id' => $company->id,
            'title' => 'Original',
            'status' => Briefing::STATUS_ACTIVE,
        ]);

        $this->actingAs($user)
            ->post(route('briefings.duplicate', $briefing))
            ->assertRedirect();

        $this->assertDatabaseCount('briefings', 2);
    }
}
