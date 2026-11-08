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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardDraftExclusionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashflow_and_overdue_ignore_draft_invoices(): void
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
        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Emma',
            'surname' => 'Claes',
            'email' => 'emma@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);
        $draftStatus = Status::query()->create(['name' => 'Draft', 'for' => 'invoices']);
        $sentStatus = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);

        $issued = $this->invoice($company->id, $customer->id, $sentStatus->id, 100);
        $this->invoice($company->id, $customer->id, $draftStatus->id, 500);

        $issued->load(['items', 'payments']);
        $expectedDue = $issued->amount_due;
        $expectedVat = $issued->tax_amount;

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.awaitingPaymentCount', 1)
                ->where('stats.overdueInvoiceCount', 1)
                ->where('stats.vatPayable', fn ($value) => round((float) $value, 2) === round($expectedVat, 2))
                ->where('chartData.totalOutstanding', fn ($value) => round((float) $value, 2) === round($expectedDue, 2))
                ->where('chartData.paymentStatus.overdue', 1)
                ->where('chartData.paymentStatus.unpaid', 0)
                ->where('chartData.cashflow.outstanding', function ($series) use ($expectedDue) {
                    return round(collect($series)->sum(), 2) === round($expectedDue, 2);
                }));
    }

    private function invoice(int $companyId, int $customerId, int $statusId, float $price): Invoice
    {
        $invoice = Invoice::create([
            'company_id' => $companyId,
            'customer_id' => $customerId,
            'invoice_date' => now()->toDateString(),
            'due_date' => now()->subDays(10)->toDateString(),
            'status' => $statusId,
            'payment_status' => Invoice::PAYMENT_UNPAID,
        ]);
        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Line',
            'quantity' => 1,
            'price' => $price,
            'total' => $price,
        ]);

        return $invoice->fresh();
    }
}
