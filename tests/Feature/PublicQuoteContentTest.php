<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Language;
use App\Models\Offer;
use App\Models\OfferBlock;
use App\Models\OfferItem;
use App\Models\Service;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicQuoteContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_quote_pdf_shows_the_written_line_and_heading_without_empty_blocks(): void
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
            'first_name' => 'Buyer',
            'surname' => 'NV',
            'email' => 'buyer@example.test',
            'type' => 'organization',
            'status' => 1,
        ]);
        $service = Service::create([
            'company_id' => $company->id,
            'name' => 'Brand strategy workshop',
            'price' => 100,
            'status' => 1,
        ]);
        $status = Status::query()->create(['name' => 'Sent', 'for' => 'offers']);
        $offer = Offer::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'offer_number' => 'OFF2026-0001',
            'offer_date' => '2026-11-08',
            'status' => $status->id,
            'share_token' => 'public-quote-token',
        ]);
        OfferItem::create([
            'offer_id' => $offer->id,
            'service_id' => $service->id,
            'description' => 'UX audit',
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);
        OfferBlock::create([
            'offer_id' => $offer->id,
            'type' => 'text',
            'sort_order' => 0,
            'content' => ['heading' => 'Website redesign', 'body' => 'Scope for the audit.'],
        ]);
        OfferBlock::create([
            'offer_id' => $offer->id,
            'type' => 'text',
            'sort_order' => 1,
            'content' => ['heading' => '', 'body' => ''],
        ]);
        OfferBlock::create([
            'offer_id' => $offer->id,
            'type' => 'table',
            'sort_order' => 2,
            'content' => ['mode' => 'lines'],
        ]);

        $offer->load(['customer', 'items.service', 'company.companySetting', 'blocks']);
        $html = view('pdf.offer', ['offer' => $offer, 'vatRate' => 21])->render();

        $this->assertStringContainsString('UX audit', $html);
        $this->assertStringContainsString('Website redesign', $html);
        $this->assertStringNotContainsString('Brand strategy workshop', $html);
        $this->assertStringNotContainsString('Column 1', $html);
    }
}
