<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Language;
use App\Models\PurchaseInvoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseInvoiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Company $company;

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
            'company_name' => 'Makani',
            'street' => 'S',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ]);
        $this->company->ensureDefaults();
        $this->user->setActiveCompanyId($this->company->id);
    }

    public function test_review_bill_is_excluded_until_booked_and_flags_a_duplicate(): void
    {
        $payload = [
            'supplier_name' => 'Proximus',
            'invoice_number' => 'PX-1',
            'invoice_date' => now()->toDateString(),
            'category' => 'telecom',
            'vat_rate' => 21,
            'lines' => [
                ['description' => 'Line', 'amount_excl' => 100],
            ],
        ];

        $this->actingAs($this->user)->post(route('purchases.store'), $payload)->assertRedirect();

        $first = PurchaseInvoice::first();
        $this->assertSame(PurchaseInvoice::STATUS_REVIEW, $first->status);
        $this->assertEquals(21, (float) $first->vat_amount);
        $this->assertEquals(121, (float) $first->amount_incl);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('stats.expenses', 0)->where('stats.expensesTracked', true));

        $this->actingAs($this->user)->post(route('purchases.book', $first))->assertRedirect();
        $first->refresh();
        $this->assertSame(PurchaseInvoice::STATUS_BOOKED, $first->status);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.expenses', 100)
                ->where('stats.inputVat', 21)
                ->where('stats.vatPayable', -21));

        $this->actingAs($this->user)->post(route('purchases.store'), [
            ...$payload,
            'invoice_number' => 'PX-2',
        ])->assertRedirect();

        $second = PurchaseInvoice::query()->where('invoice_number', 'PX-2')->first();
        $this->assertContains('dup', $second->flags ?? []);
    }

    public function test_urgent_note_and_iban_change_are_flagged(): void
    {
        $this->actingAs($this->user)->post(route('purchases.store'), [
            'supplier_name' => 'Peeters',
            'invoice_number' => 'GP-1',
            'invoice_date' => now()->subMonth()->toDateString(),
            'category' => 'subcontracting',
            'vat_rate' => 21,
            'iban' => 'BE71096123456769',
            'lines' => [
                ['description' => 'Hire', 'amount_excl' => 100],
            ],
        ])->assertRedirect();

        $first = PurchaseInvoice::first();
        $this->actingAs($this->user)->post(route('purchases.book', $first))->assertRedirect();

        $this->actingAs($this->user)->post(route('purchases.store'), [
            'supplier_id' => $first->supplier_id,
            'supplier_name' => 'Peeters',
            'invoice_number' => 'GP-2',
            'invoice_date' => now()->toDateString(),
            'category' => 'subcontracting',
            'vat_rate' => 21,
            'iban' => 'LT121000011101001000',
            'payment_note' => 'Please pay within 24 hours',
            'lines' => [
                ['description' => 'Hire', 'amount_excl' => 1200],
            ],
        ])->assertRedirect();

        $second = PurchaseInvoice::query()->where('invoice_number', 'GP-2')->first();
        $this->assertContains('iban', $second->flags ?? []);
        $this->assertContains('amount', $second->flags ?? []);
        $this->assertContains('urgent', $second->flags ?? []);
        $this->assertSame(PurchaseInvoice::STATUS_REVIEW, $second->status);
    }
}
