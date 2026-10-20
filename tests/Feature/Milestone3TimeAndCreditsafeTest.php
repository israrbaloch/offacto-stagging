<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class Milestone3TimeAndCreditsafeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Company $company;

    private Customer $customer;

    private Service $hourlyService;

    protected function setUp(): void
    {
        parent::setUp();
        Language::query()->create(['name' => 'English', 'code' => 'en']);

        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->company = Company::create([
            'user_id' => $this->user->id,
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
        $this->company->ensureDefaults();
        $this->user->setActiveCompanyId($this->company->id);

        $this->customer = Customer::create([
            'company_id' => $this->company->id,
            'first_name' => 'Pat',
            'surname' => 'Client',
            'email' => 'client@example.test',
            'vat_number' => 'BE0999999999',
            'type' => 'individual',
            'status' => 1,
        ]);

        $this->hourlyService = Service::create([
            'company_id' => $this->company->id,
            'name' => 'Consulting',
            'price' => 100,
            'billing_mode' => 'hourly',
            'unit' => 'hour',
            'status' => 1,
        ]);
    }

    public function test_manual_time_entry_requires_hourly_service(): void
    {
        $fixed = Service::create([
            'company_id' => $this->company->id,
            'name' => 'Fixed pack',
            'price' => 500,
            'billing_mode' => 'fixed',
            'status' => 1,
        ]);

        $this->actingAs($this->user)
            ->post(route('time.store'), [
                'service_id' => $fixed->id,
                'customer_id' => $this->customer->id,
                'started_at' => now()->subHours(2)->toIso8601String(),
                'ended_at' => now()->toIso8601String(),
                'billable' => true,
            ])
            ->assertSessionHasErrors('service_id');

        $this->assertDatabaseCount('time_entries', 0);
    }

    public function test_manual_time_entry_is_stored(): void
    {
        $start = now()->subHours(2);
        $end = now();

        $this->actingAs($this->user)
            ->post(route('time.store'), [
                'service_id' => $this->hourlyService->id,
                'customer_id' => $this->customer->id,
                'description' => 'Workshop',
                'started_at' => $start->toDateTimeString(),
                'ended_at' => $end->toDateTimeString(),
                'billable' => true,
            ])
            ->assertRedirect(route('time.index'));

        $entry = TimeEntry::first();
        $this->assertNotNull($entry);
        $this->assertSame(TimeEntry::STATUS_COMPLETED, $entry->status);
        $this->assertSame($this->hourlyService->id, $entry->service_id);
        $this->assertGreaterThan(0, $entry->duration_seconds);
    }

    public function test_timer_start_and_stop_creates_completed_entry(): void
    {
        $this->actingAs($this->user)
            ->postJson(route('time.timer.start'), [
                'service_id' => $this->hourlyService->id,
                'customer_id' => $this->customer->id,
                'billable' => true,
            ])
            ->assertOk()
            ->assertJsonPath('running.service.id', $this->hourlyService->id);

        $this->assertDatabaseHas('time_entries', [
            'status' => TimeEntry::STATUS_RUNNING,
            'service_id' => $this->hourlyService->id,
        ]);

        $this->actingAs($this->user)
            ->postJson(route('time.timer.stop'))
            ->assertOk();

        $entry = TimeEntry::first();
        $this->assertSame(TimeEntry::STATUS_COMPLETED, $entry->status);
        $this->assertNotNull($entry->ended_at);
    }

    public function test_invoice_from_time_entries_groups_hours_and_marks_invoiced(): void
    {
        Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);

        $entry = TimeEntry::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->hourlyService->id,
            'started_at' => now()->subHours(3),
            'ended_at' => now(),
            'duration_seconds' => 3 * 3600,
            'billable' => true,
            'status' => TimeEntry::STATUS_COMPLETED,
        ]);

        $this->actingAs($this->user)
            ->post(route('invoices.from-time'), [
                'customer_id' => $this->customer->id,
                'time_entry_ids' => [$entry->id],
            ])
            ->assertRedirect();

        $entry->refresh();
        $this->assertSame(TimeEntry::STATUS_INVOICED, $entry->status);
        $this->assertNotNull($entry->invoice_id);

        $item = InvoiceItem::where('invoice_id', $entry->invoice_id)->first();
        $this->assertNotNull($item);
        $this->assertEquals(3.0, (float) $item->quantity);
        $this->assertEquals(100.0, (float) $item->price);
    }

    public function test_creditsafe_check_stores_result(): void
    {
        SiteSetting::set('int_creditsafe_enabled', '1', 'boolean');

        $settings = $this->company->fresh()->companySetting;
        $settings->update([
            'creditsafe_enabled' => true,
            'creditsafe_test_api_key' => 'test-key',
        ]);

        Http::fake([
            '*/companies/BE/BE0999999999/creditsummary' => Http::response([
                'rating' => 'A',
                'status' => 'Active',
            ], 200),
        ]);

        $this->actingAs($this->user)
            ->post(route('customers.credit-check', $this->customer))
            ->assertRedirect();

        $this->assertDatabaseHas('customer_credit_checks', [
            'customer_id' => $this->customer->id,
            'company_id' => $this->company->id,
            'rating' => 'A',
        ]);
    }
}
