<?php

namespace Tests\Feature;

use App\Mail\InvoiceSent;
use App\Models\Company;
use Database\Seeders\AddCountries;
use Database\Seeders\AddStatuses;
use Database\Seeders\DemoDataSeeder;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\NumberingSeries;
use App\Models\Offer;
use App\Models\Service;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InvoiceNumberingTest extends TestCase
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
            'type' => 'individual',
            'status' => 1,
        ]);

        $this->service = Service::create([
            'company_id' => $this->company->id,
            'name' => 'Work',
            'price' => 100,
            'status' => 1,
        ]);

        $this->draft = Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);
        Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);
    }

    public function test_opening_new_invoice_does_not_create_a_draft_or_take_a_number(): void
    {
        $year = now()->format('Y');

        $this->actingAs($this->user)
            ->get(route('invoices.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Invoices/Create')
                ->where('invoice', null)
                ->where('nextInvoiceNumber', 'OFF_'.$year.'-0001'));

        $this->assertDatabaseCount('invoices', 0);
        $this->assertSame('1', (string) $this->series()->next_number);
    }

    public function test_saving_a_draft_does_not_take_a_number(): void
    {
        $this->actingAs($this->user)
            ->post(route('invoices.store'), [
                'customer_id' => $this->customer->id,
                'status' => $this->draft->id,
                'invoice_date' => now()->toDateString(),
                'due_date' => now()->addDays(30)->toDateString(),
                'items' => [[
                    'service_id' => $this->service->id,
                    'description' => 'Line',
                    'quantity' => 1,
                    'price' => 100,
                ]],
            ])
            ->assertRedirect();

        $invoice = Invoice::query()->first();
        $this->assertNotNull($invoice);
        $this->assertNull($invoice->invoice_number);
        $this->assertSame('1', (string) $this->series()->next_number);
    }

    public function test_sending_assigns_the_next_number_once(): void
    {
        Mail::fake();

        $invoice = Invoice::create([
            'company_id' => $this->company->id,
            'customer_id' => $this->customer->id,
            'invoice_number' => null,
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'status' => $this->draft->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'service_id' => $this->service->id,
            'description' => 'Line',
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);

        $this->actingAs($this->user)
            ->post(route('invoices.send', $invoice), [
                'channels' => ['email'],
                'emails' => ['client@example.test'],
                'message' => 'Please find your invoice.',
            ])
            ->assertRedirect();

        $year = now()->format('Y');
        $invoice->refresh();
        $this->assertSame('OFF_'.$year.'-0001', $invoice->invoice_number);
        $this->assertSame('2', (string) $this->series()->next_number);

        $this->actingAs($this->user)
            ->post(route('invoices.send', $invoice), [
                'channels' => ['email'],
                'emails' => ['client@example.test'],
                'message' => 'Please find your invoice.',
            ])
            ->assertRedirect();

        $this->assertSame('OFF_'.$year.'-0001', $invoice->fresh()->invoice_number);
        $this->assertSame('2', (string) $this->series()->fresh()->next_number);
        Mail::assertSent(InvoiceSent::class);
    }

    public function test_quotes_do_not_consume_an_invoices_only_series(): void
    {
        $invoiceSeries = $this->series();
        $invoiceSeries->update([
            'type' => 'invoices',
            'prefix' => 'INV',
            'next_number' => '7',
        ]);
        Status::query()->create(['name' => 'Draft', 'for' => 'offers']);

        $this->actingAs($this->user)
            ->get(route('offers.create'))
            ->assertRedirect();

        $year = now()->format('Y');
        $offer = Offer::query()->where('company_id', $this->company->id)->first();
        $this->assertNotNull($offer);
        $this->assertSame('OFF'.$year.'-0001', $offer->offer_number);
        $this->assertSame('7', (string) $invoiceSeries->fresh()->next_number);

        $offerSeries = NumberingSeries::query()
            ->where('company_id', $this->company->id)
            ->where('type', 'offers')
            ->first();
        $this->assertNotNull($offerSeries);
        $this->assertSame('OFF', $offerSeries->prefix);
        $this->assertSame('2', (string) $offerSeries->next_number);

        $this->actingAs($this->user)
            ->get(route('offers.create'))
            ->assertRedirect();

        $second = Offer::query()->where('company_id', $this->company->id)->orderByDesc('id')->first();
        $this->assertSame('OFF'.$year.'-0002', $second->offer_number);
        $this->assertSame('7', (string) $invoiceSeries->fresh()->next_number);
        $this->assertSame('3', (string) $offerSeries->fresh()->next_number);
    }

    public function test_a_shared_series_still_numbers_quotes_and_invoices_together(): void
    {
        $series = $this->series();
        $series->update([
            'type' => 'both',
            'prefix' => 'DOC',
            'next_number' => '4',
        ]);
        Status::query()->create(['name' => 'Draft', 'for' => 'offers']);

        $this->actingAs($this->user)
            ->get(route('offers.create'))
            ->assertRedirect();

        $year = now()->format('Y');
        $offer = Offer::query()->where('company_id', $this->company->id)->first();
        $this->assertSame('DOC'.$year.'-0004', $offer->offer_number);
        $this->assertSame('5', (string) $series->fresh()->next_number);
        $this->assertSame(1, NumberingSeries::query()->where('company_id', $this->company->id)->count());
    }

    public function test_demo_seeder_uses_separate_series_and_leaves_draft_invoices_unnumbered(): void
    {
        $this->seed(AddCountries::class);
        $this->seed(AddStatuses::class);

        $this->series()->update([
            'name' => 'INV-001',
            'type' => 'invoices',
            'prefix' => 'INV',
            'next_number' => '9',
        ]);
        NumberingSeries::create([
            'company_id' => $this->company->id,
            'name' => 'OFF-001',
            'type' => 'offers',
            'prefix' => 'OFF',
            'year_month' => 'year',
            'separator' => '-',
            'digits' => '4',
            'next_number' => '9',
            'restart_count' => 'annual',
        ]);

        $this->seed(DemoDataSeeder::class);

        $year = now()->format('Y');
        $offers = Offer::query()->where('company_id', $this->company->id)->orderBy('id')->pluck('offer_number')->all();
        $this->assertSame([
            'OFF'.$year.'-0001',
            'OFF'.$year.'-0002',
            'OFF'.$year.'-0003',
        ], $offers);

        $this->assertSame(1, Invoice::query()->where('company_id', $this->company->id)->whereNull('invoice_number')->count());
        $numbers = Invoice::query()
            ->where('company_id', $this->company->id)
            ->whereNotNull('invoice_number')
            ->orderBy('id')
            ->pluck('invoice_number')
            ->all();
        $this->assertSame([
            'INV'.$year.'-0001',
            'INV'.$year.'-0002',
            'INV'.$year.'-0003',
            'INV'.$year.'-0004',
        ], $numbers);

        $this->assertSame('5', (string) NumberingSeries::query()->where('company_id', $this->company->id)->where('type', 'invoices')->value('next_number'));
        $this->assertSame('4', (string) NumberingSeries::query()->where('company_id', $this->company->id)->where('type', 'offers')->value('next_number'));
    }

    private function series(): NumberingSeries
    {
        return NumberingSeries::query()->where('company_id', $this->company->id)->firstOrFail();
    }
}
