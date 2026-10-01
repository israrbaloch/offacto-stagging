<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordOtpMail;
use App\Models\Language;
use App\Models\PasswordOtp;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationEmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Language::query()->create(['name' => 'English', 'code' => 'en']);
    }

    public function test_registration_redirects_to_email_verification(): void
    {
        Mail::fake();

        $languageId = Language::first()->id;

        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'company_name' => 'Acme',
            'first_name' => 'Test',
            'surname' => 'User',
            'email_company' => 'billing@acme.test',
            'phone' => '+32 000',
            'street' => 'Main',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'language' => $languageId,
        ])->assertRedirect(route('register.verify'));

        $this->assertGuest();
        Mail::assertSent(PasswordOtpMail::class);
        $this->assertDatabaseHas('password_otps', [
            'email' => 'test@example.com',
            'purpose' => EmailOtpService::PURPOSE_EMAIL_VERIFICATION,
        ]);
    }

    public function test_unverified_user_cannot_login_without_otp(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create([
            'password' => Hash::make('Password1!'),
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ])->assertRedirect(route('register.verify'));

        $this->assertGuest();
        Mail::assertSent(PasswordOtpMail::class);
    }

    public function test_verification_code_logs_user_in(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create([
            'password' => Hash::make('Password1!'),
        ]);

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ])->assertRedirect(route('register.verify'));

        PasswordOtp::query()->where('email', $user->email)->update([
            'code_hash' => Hash::make('123456'),
            'purpose' => EmailOtpService::PURPOSE_EMAIL_VERIFICATION,
        ]);

        $this->post('/register/verify', ['code' => '123456'])
            ->assertRedirect(route('login'));

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_registration_resend_stays_on_verify_page(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create();

        $this->withSession(['email_verification_email' => $user->email])
            ->post('/register/resend')
            ->assertRedirect(route('register.verify'));
    }
}
