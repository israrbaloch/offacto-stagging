<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Language;
use App\Models\Status;
use App\Models\User;
use App\Support\BelgianPaymentReference;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicInvoicePaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_invoice_shows_vat_numbers_iban_and_structured_reference(): void
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
        CompanySetting::query()->where('company_id', $company->id)->update([
            'iban' => 'BE68539007547034',
        ]);

        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Buyer',
            'surname' => 'NV',
            'email' => 'buyer@example.test',
            'type' => 'organization',
            'vat_number' => 'BE0999999999',
            'status' => 1,
        ]);

        $sent = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);

        $invoice = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'status' => $sent->id,
            'invoice_number' => 'INV2026-0001',
            'invoice_date' => '2026-11-08',
            'due_date' => '2026-12-08',
            'share_token' => 'public-payment-token',
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);

        $reference = BelgianPaymentReference::fromDocument('INV2026-0001');

        $this->get(route('invoices.public', 'public-payment-token'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('invoice.company.vat_number', 'BE0123456749')
                ->where('invoice.company.iban', 'BE68 5390 0754 7034')
                ->where('invoice.customer.vat_number', 'BE0999999999')
                ->where('invoice.structured_reference', $reference));

        $invoice->load(['customer', 'company.companySetting']);
        $html = view('pdf.invoice', ['invoice' => $invoice, 'vatRate' => 21])->render();
        $this->assertStringContainsString('VAT: BE0123456749', $html);
        $this->assertStringContainsString('VAT: BE0999999999', $html);
        $this->assertStringContainsString('BE68 5390 0754 7034', $html);
        $this->assertStringContainsString($reference, $html);
    }
}
