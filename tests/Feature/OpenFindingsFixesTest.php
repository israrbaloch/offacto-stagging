<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Offer;
use App\Models\Status;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OpenFindingsFixesTest extends TestCase
{
    use RefreshDatabase;

    public function test_opening_a_new_quote_does_not_store_a_draft(): void
    {
        [$user] = $this->workspace();

        $this->actingAs($user)
            ->get('/offers/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Offers/Create')
                ->where('offer', null));

        $this->assertSame(0, Offer::query()->count());
    }

    public function test_invoice_list_defaults_to_the_current_quarter(): void
    {
        [$user, $company] = $this->workspace();
        $status = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);

        $older = Invoice::create([
            'company_id' => $company->id,
            'invoice_date' => now()->subQuarter()->toDateString(),
            'due_date' => now()->subQuarter()->addDays(14)->toDateString(),
            'status' => $status->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        InvoiceItem::create([
            'invoice_id' => $older->id,
            'description' => 'Earlier quarter',
            'quantity' => 1,
            'price' => 10,
            'total' => 10,
        ]);

        $current = Invoice::create([
            'company_id' => $company->id,
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(14)->toDateString(),
            'status' => $status->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        InvoiceItem::create([
            'invoice_id' => $current->id,
            'description' => 'This quarter',
            'quantity' => 1,
            'price' => 20,
            'total' => 20,
        ]);

        $this->actingAs($user)
            ->get('/invoices')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.date_filter', 'current_quarter')
                ->has('invoices.data', 1)
                ->where('invoices.data.0.id', $current->id));
    }

    public function test_a_short_time_entry_is_visible_in_the_week_total(): void
    {
        [$user, $company] = $this->workspace();

        TimeEntry::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'description' => 'Short session',
            'started_at' => now()->subSeconds(30),
            'ended_at' => now(),
            'duration_seconds' => 30,
            'billable' => true,
            'status' => TimeEntry::STATUS_COMPLETED,
        ]);

        $this->actingAs($user)
            ->get('/time')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('weekStats.total_display', '0h 00m 30s')
                ->where('weekStats.billable_percent', 100)
                ->where('weekStats.days', function ($days) {
                    return collect($days)->contains(fn ($day) => $day['display'] === '0h 00m 30s');
                }));
    }

    public function test_dutch_dashboard_translates_activity_and_month_labels(): void
    {
        [$user, $company] = $this->workspace();
        $draft = Status::query()->create(['name' => 'Draft', 'for' => 'offers']);
        Offer::create([
            'company_id' => $company->id,
            'customer_id' => null,
            'offer_number' => 'OFF2026-0003',
            'offer_date' => now()->toDateString(),
            'status' => $draft->id,
        ]);

        $this->actingAs($user)
            ->withSession(['locale' => 'nl'])
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.revenueChangePct', null)
                ->where('recentActivity', function ($items) {
                    return collect($items)->contains(fn ($item) => $item['title'] === 'Open offerte · Geen klant'
                        && $item['meta'] === 'OFF2026-0003');
                })
                ->where('chartData.cashflow.labels.11', 'nov'));
    }

    public function test_a_public_invoice_can_be_acknowledged_without_a_signature(): void
    {
        [, $company] = $this->workspace();
        $status = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);
        $invoice = Invoice::create([
            'company_id' => $company->id,
            'invoice_number' => 'INV2026-0002',
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(14)->toDateString(),
            'status' => $status->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
            'share_token' => 'ack-without-signature',
        ]);

        $this->post('/i/ack-without-signature/acknowledge', [])
            ->assertRedirect();

        $this->assertNotNull($invoice->fresh()->customer_acknowledged_at);
        $this->assertNull($invoice->fresh()->signature_data);
    }

    public function test_search_returns_the_customer_together_with_a_matching_invoice(): void
    {
        [$user, $company] = $this->workspace();
        $status = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);
        Customer::create([
            'company_id' => $company->id,
            'first_name' => 'North',
            'surname' => 'Wind',
            'org_name' => 'Northwind',
            'email' => 'north@example.test',
            'type' => 'company',
            'status' => 1,
        ]);
        Invoice::create([
            'company_id' => $company->id,
            'invoice_number' => 'INV-NORTH-1',
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->addDays(14)->toDateString(),
            'status' => $status->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        $this->actingAs($user)
            ->getJson('/search?suggest=1&q=North')
            ->assertOk()
            ->assertJsonPath('invoices.0.label', 'INV-NORTH-1')
            ->assertJsonPath('customers.0.label', 'Northwind');
    }

    /**
     * @return array{0: User, 1: Company}
     */
    private function workspace(): array
    {
        Language::query()->create(['name' => 'English', 'code' => 'en']);
        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'first_name' => 'A',
            'surname' => 'B',
            'language' => Language::query()->value('id'),
            'email' => 'co@example.test',
            'phone' => '+32000000001',
            'vat_number' => 'BE0123456749',
            'company_name' => 'Seller BV',
            'street' => 'S',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ]);
        $company->ensureDefaults();
        $user->setActiveCompanyId($company->id);

        return [$user, $company];
    }
}
