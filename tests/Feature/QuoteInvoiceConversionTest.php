<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Language;
use App\Models\Offer;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuoteInvoiceConversionTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_quote_converts_to_one_invoice_and_the_second_visit_opens_that_invoice(): void
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
        Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);
        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Emma',
            'surname' => 'Claes',
            'email' => 'emma@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);
        $offerStatus = Status::query()->create(['name' => 'Accepted', 'for' => 'offers']);
        $offer = Offer::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'offer_number' => 'OFF2026-0008',
            'offer_date' => '2026-11-08',
            'status' => $offerStatus->id,
            'share_token' => 'convert-once',
        ]);

        $this->actingAs($user)
            ->get('/invoices/from-offer/'.$offer->id)
            ->assertRedirect();

        $invoice = Invoice::query()->where('offer_id', $offer->id)->first();
        $this->assertNotNull($invoice);
        $this->assertNull($invoice->invoice_number);

        $this->actingAs($user)
            ->get('/invoices/from-offer/'.$offer->id)
            ->assertRedirect(route('invoices.edit', $invoice))
            ->assertSessionHas('error', 'This quote already has an invoice.');

        $this->assertSame(1, Invoice::query()->where('offer_id', $offer->id)->count());
    }
}
