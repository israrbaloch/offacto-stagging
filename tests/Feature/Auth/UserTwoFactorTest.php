<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserMfaCredential;
use App\Services\AdminMfaService;
use App\Services\TotpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class UserTwoFactorTest extends TestCase
{
    use InteractsWithAdmin;
    use RefreshDatabase;

    public function test_workspace_user_with_2fa_must_verify_after_login(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'is_active' => true,
            'two_factor_enabled' => true,
        ]);

        $this->makeCompany($user);

        $totp = app(TotpService::class);
        $secret = $totp->generateSecret();
        UserMfaCredential::create([
            'user_id' => $user->id,
            'secret' => $secret,
            'recovery_codes' => [Hash::make('ABCD-EFGH')],
            'confirmed_at' => now(),
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('two-factor.challenge'));

        $this->get('/dashboard')->assertRedirect(route('two-factor.challenge'));

        $this->post('/two-factor/verify', [
            'code' => $totp->currentCode($secret),
        ])->assertRedirect(route('dashboard'));

        $this->get('/dashboard')->assertOk();
    }

    public function test_user_can_enable_2fa_from_profile_and_is_sent_to_enroll(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
            'is_active' => true,
            'two_factor_enabled' => false,
        ]);

        $this->makeCompany($user);

        $this->actingAs($user)->post(route('profile.two-factor'), ['enabled' => true])
            ->assertRedirect(route('two-factor.enroll'));

        $this->assertTrue($user->fresh()->two_factor_enabled);
    }
}
