<?php

namespace Tests\Feature;

use App\Models\Country;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Offer;
use App\Models\Service;
use App\Models\Status;
use App\Models\TimeEntry;
use App\Models\User;
use App\Support\InvoiceReminderMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediumWorkflowFixesTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Company $company;

    private Customer $customer;

    private Service $service;

    private Status $draft;

    protected function setUp(): void
    {
        parent::setUp();
        Language::query()->create(['name' => 'English', 'code' => 'en']);
        $this->user = User::factory()->create(['email_verified_at' => now()]);
        $this->company = Company::create([
            'user_id' => $this->user->id,
            'first_name' => 'A',
            'surname' => 'B',
            'language' => Language::query()->value('id'),
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
            'type' => 'individual',
            'status' => 1,
        ]);
        $this->service = Service::create([
            'company_id' => $this->company->id,
            'name' => 'Development (hourly)',
            'price' => 95,
            'status' => 1,
        ]);
        $this->draft = Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);
        Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);
        Status::query()->create(['name' => 'Draft', 'for' => 'offers']);
    }

    public function test_reminder_box_is_plain_text_and_the_email_body_is_html(): void
    {
        $invoice = $this->invoice();
        $plain = InvoiceReminderMessage::editorBody($invoice);

        $this->assertStringNotContainsString('<p>', $plain);
        $this->assertStringNotContainsString('<strong>', $plain);
        $this->assertStringContainsString($invoice->invoice_number, $plain);

        $html = InvoiceReminderMessage::resolve($invoice, $plain)['body'];
        $this->assertStringContainsString('<p>', $html);
        $this->assertStringNotContainsString('&lt;p&gt;', $html);
        $this->assertStringContainsString($invoice->invoice_number, $html);
    }

    public function test_a_quote_vat_choice_changes_the_total(): void
    {
        $offer = Offer::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'offer_number' => 'OFF2026-0099',
            'offer_date' => now(),
            'status' => Status::query()->where('for', 'offers')->value('id'),
        ]);
        $offer->items()->create([
            'service_id' => $this->service->id,
            'description' => 'Work',
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);

        $this->actingAs($this->user)
            ->put(route('offers.update', $offer), [
                'customer_id' => $this->customer->id,
                'status' => $offer->status,
                'vat_rate' => 6,
                'items' => [[
                    'service_id' => $this->service->id,
                    'description' => 'Work',
                    'quantity' => 1,
                    'price' => 100,
                ]],
            ])
            ->assertRedirect();

        $offer->refresh();
        $this->assertEquals(6.0, (float) $offer->vat_rate);
        $this->assertEquals(6.0, $offer->tax_amount);
        $this->assertEquals(106.0, $offer->total);
    }

    public function test_import_hours_adds_lines_to_the_open_draft_and_marks_them_invoiced(): void
    {
        $invoice = $this->invoice();
        $entry = TimeEntry::create([
            'company_id' => $this->company->id,
            'user_id' => $this->user->id,
            'customer_id' => $this->customer->id,
            'service_id' => $this->service->id,
            'description' => 'Workshop',
            'started_at' => now()->subHours(2),
            'ended_at' => now(),
            'duration_seconds' => 2 * 3600,
            'billable' => true,
            'status' => TimeEntry::STATUS_COMPLETED,
        ]);

        $this->actingAs($this->user)
            ->getJson(route('invoices.uninvoiced-time', ['customer_id' => $this->customer->id]))
            ->assertOk()
            ->assertJsonPath('data.0.id', $entry->id);

        $this->actingAs($this->user)
            ->put(route('invoices.update', $invoice), [
                'customer_id' => $this->customer->id,
                'status' => $this->draft->id,
                'invoice_date' => now()->toDateString(),
                'due_date' => now()->addDays(21)->toDateString(),
                'payment_term' => 'days:21',
                'time_entry_ids' => [$entry->id],
                'items' => [[
                    'service_id' => $this->service->id,
                    'description' => 'Workshop',
                    'quantity' => 2,
                    'price' => 95,
                ]],
            ])
            ->assertRedirect();

        $entry->refresh();
        $this->assertSame(TimeEntry::STATUS_INVOICED, $entry->status);
        $this->assertSame($invoice->id, $entry->invoice_id);
        $this->assertSame('days:21', $invoice->fresh()->payment_term);
        $this->assertSame(1, InvoiceItem::query()->where('invoice_id', $invoice->id)->count());
    }

    public function test_mark_as_paid_records_the_outstanding_amount(): void
    {
        $sent = Status::query()->where('name', 'Sent')->where('for', 'invoices')->first();
        $invoice = $this->invoice();
        $invoice->update([
            'status' => $sent->id,
            'invoice_number' => 'INV2026-0099',
        ]);

        $this->actingAs($this->user)
            ->from(route('invoices.edit', $invoice))
            ->post(route('invoices.payment', $invoice), [
                'amount' => $invoice->fresh()->amount_due,
                'payment_date' => now()->toDateString(),
                'payment_method' => 'bank_transfer',
            ])
            ->assertRedirect(route('invoices.edit', $invoice));

        $this->assertSame(Invoice::PAYMENT_PAID, $invoice->fresh()->payment_status);
    }

    public function test_a_customer_address_is_stored(): void
    {
        $country = Country::query()->create(['name' => 'Belgium', 'code' => 'BE']);
        $status = Status::query()->create(['name' => 'Active', 'for' => 'customers']);

        $this->actingAs($this->user)
            ->post(route('customers.store'), [
                'type' => 'individual',
                'first_name' => 'Els',
                'surname' => 'Peeters',
                'email' => 'els@example.test',
                'country_id' => $country->id,
                'office_address' => 'Wetstraat 1, 1000 Brussel',
                'status' => $status->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('customers', [
            'email' => 'els@example.test',
            'office_address' => 'Wetstraat 1, 1000 Brussel',
        ]);
    }

    private function invoice(): Invoice
    {
        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'invoice_number' => 'INV2026-0008',
            'invoice_date' => '2026-10-29',
            'due_date' => '2026-11-19',
            'status' => $this->draft->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'service_id' => $this->service->id,
            'description' => 'Frontend and backend implementation.',
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);

        return $invoice;
    }
}
