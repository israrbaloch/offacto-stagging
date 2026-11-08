<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Language;
use App\Models\Offer;
use App\Models\Status;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicQuoteAcceptanceTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    public function test_accept_rejects_an_empty_canvas_and_a_missing_name(): void
    {
        $offer = $this->offer();

        $this->from('/q/'.$offer->share_token)
            ->post('/q/'.$offer->share_token.'/accept', [
                'signer_name' => '   ',
                'signature' => '',
            ])
            ->assertSessionHasErrors(['signer_name']);

        $this->from('/q/'.$offer->share_token)
            ->post('/q/'.$offer->share_token.'/accept', [
                'signer_name' => 'Emma Claes',
                'signature' => '',
            ])
            ->assertSessionHasErrors(['signature']);

        $offer->refresh();
        $this->assertNull($offer->accepted_at);
        $this->assertNull($offer->signer_name);
    }

    public function test_accept_stores_the_signature_and_signer_name(): void
    {
        $offer = $this->offer();

        $this->from('/q/'.$offer->share_token)
            ->post('/q/'.$offer->share_token.'/accept', [
                'signer_name' => ' Emma Claes ',
                'signature' => self::PNG,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $offer->refresh();
        $this->assertNotNull($offer->accepted_at);
        $this->assertSame('Emma Claes', $offer->signer_name);
        $this->assertSame(self::PNG, $offer->signature_data);
    }

    private function offer(): Offer
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
        $status = Status::query()->create(['name' => 'Sent', 'for' => 'offers']);

        return Offer::create([
            'company_id' => $company->id,
            'offer_number' => 'OFF2026-0009',
            'offer_date' => '2026-11-08',
            'status' => $status->id,
            'share_token' => 'public-accept-token',
        ]);
    }
}
