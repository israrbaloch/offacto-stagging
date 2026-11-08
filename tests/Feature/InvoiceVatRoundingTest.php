<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceVatRoundingTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_hourly_line_stores_vat_that_adds_up_to_the_total(): void
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
        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Emma',
            'surname' => 'Claes',
            'email' => 'emma@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);
        $status = Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);
        $invoice = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'invoice_date' => '2026-11-08',
            'due_date' => '2026-12-08',
            'status' => $status->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        $item = new InvoiceItem([
            'description' => 'Copywriting',
            'quantity' => 1.5,
            'price' => 65,
        ]);
        $item->calculateTotal();
        $invoice->items()->save($item);

        $invoice->load('items');

        $this->assertSame(97.5, $invoice->subtotal);
        $this->assertSame(20.48, $invoice->tax_amount);
        $this->assertSame(117.98, $invoice->total);
    }
}
