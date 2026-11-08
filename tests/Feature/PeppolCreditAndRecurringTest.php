<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Status;
use App\Models\User;
use App\Services\PeppolDirectoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PeppolCreditAndRecurringTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_peppol_badge_follows_company_configuration(): void
    {
        [$user] = $this->companyUser();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('peppolConfigured', false));
    }

    public function test_peppol_lookup_finds_a_belgian_participant_without_access_point_keys(): void
    {
        Http::fake([
            'directory.peppol.eu/*' => Http::response([
                'total-result-count' => 1,
                'matches' => [[
                    'participantID' => ['scheme' => 'iso6523-actorid-upis', 'value' => '0208:0202239951'],
                    'entities' => [[
                        'name' => [['name' => 'Proximus S.A.', 'language' => 'nl']],
                        'countryCode' => 'BE',
                    ]],
                ]],
            ]),
        ]);

        $found = app(PeppolDirectoryService::class)->lookup('BE0202239951', 'BE');
        $this->assertTrue($found['found']);
        $this->assertSame('Proximus S.A.', $found['name']);
        $this->assertSame('0208:0202239951', $found['participant_id']);

        Http::fake([
            'directory.peppol.eu/*' => Http::response([
                'total-result-count' => 0,
                'matches' => [],
            ]),
        ]);

        $missing = app(PeppolDirectoryService::class)->lookup('BE0000000097', 'BE');
        $this->assertFalse($missing['found']);
        $this->assertNull($missing['error']);

        [$user] = $this->companyUser();
        Http::fake([
            'directory.peppol.eu/*' => Http::response([
                'total-result-count' => 1,
                'matches' => [[
                    'participantID' => ['value' => '0208:0202239951'],
                    'entities' => [['name' => [['name' => 'Proximus S.A.']]]],
                ]],
            ]),
        ]);

        $this->actingAs($user)
            ->getJson('/customers/peppol-lookup?vat=BE0202239951&country=BE')
            ->assertOk()
            ->assertJsonPath('data.found', true)
            ->assertJsonPath('data.name', 'Proximus S.A.');
    }

    public function test_credit_note_and_recurring_drafts_are_created_from_a_sent_invoice(): void
    {
        [$user, $company, $customer, $draftStatus, $sentStatus] = $this->companyUser();

        $source = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'invoice_number' => 'INV2026-0008',
            'invoice_date' => '2026-11-01',
            'due_date' => '2026-12-01',
            'status' => $sentStatus->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        $source->items()->save(new InvoiceItem([
            'description' => 'Copywriting',
            'quantity' => 2,
            'price' => 65,
            'total' => 130,
        ]));

        $draft = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'invoice_number' => null,
            'invoice_date' => '2026-11-08',
            'due_date' => '2026-12-08',
            'status' => $draftStatus->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        $this->actingAs($user)
            ->getJson('/invoices/issued-sources')
            ->assertOk()
            ->assertJsonPath('data.0.id', $source->id)
            ->assertJsonMissing(['id' => $draft->id]);

        $this->actingAs($user)
            ->post('/invoices/'.$source->id.'/credit-note')
            ->assertRedirect();

        $credit = Invoice::query()->where('parent_invoice_id', $source->id)->first();
        $this->assertNotNull($credit);
        $this->assertNull($credit->invoice_number);
        $this->assertTrue($credit->isCreditNote());
        $this->assertSame(-2.0, (float) $credit->items()->value('quantity'));

        $this->actingAs($user)
            ->post('/invoices/'.$source->id.'/recurring-from')
            ->assertRedirect();

        $recurring = Invoice::query()->where('is_recurring', true)->first();
        $this->assertNotNull($recurring);
        $this->assertNull($recurring->invoice_number);
        $this->assertSame('monthly', $recurring->recurring_interval);
        $this->assertNotNull($recurring->next_run_at);

        $this->actingAs($user)
            ->put('/invoices/'.$draft->id, [
                'customer_id' => $customer->id,
                'invoice_date' => '2026-11-08',
                'due_date' => '2026-12-08',
                'status' => $draftStatus->id,
                'is_recurring' => true,
                'recurring_interval' => 'yearly',
                'items' => [[
                    'description' => 'Retainer',
                    'quantity' => 1,
                    'price' => 100,
                ]],
            ])
            ->assertRedirect();

        $draft->refresh();
        $this->assertTrue($draft->is_recurring);
        $this->assertSame('yearly', $draft->recurring_interval);
    }

    /**
     * @return array{0: User, 1: Company, 2: Customer, 3: Status, 4: Status}
     */
    private function companyUser(): array
    {
        Language::query()->firstOrCreate(['code' => 'en'], ['name' => 'English']);
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
        $draft = Status::query()->firstOrCreate(['name' => 'Draft', 'for' => 'invoices']);
        $sent = Status::query()->firstOrCreate(['name' => 'Sent', 'for' => 'invoices']);
        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Emma',
            'surname' => 'Claes',
            'email' => 'emma@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);

        return [$user, $company, $customer, $draft, $sent];
    }
}
