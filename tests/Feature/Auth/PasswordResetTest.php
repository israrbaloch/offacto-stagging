<?php

namespace Tests\Feature\Auth;

use App\Mail\PasswordOtpMail;
use App\Models\PasswordOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $this->get('/forgot-password')->assertOk();
    }

    public function test_otp_can_be_requested_for_existing_user(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertRedirect(route('password.otp'));

        Mail::assertSent(PasswordOtpMail::class, fn ($mail) => $mail->hasTo($user->email));
        $this->assertDatabaseHas('password_otps', ['email' => $user->email]);
    }

    public function test_otp_screen_requires_session(): void
    {
        $this->get('/forgot-password/verify')->assertRedirect(route('password.request'));
    }

    public function test_valid_otp_opens_reset_screen_and_updates_password(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertRedirect(route('password.otp'));

        $this->get('/forgot-password/verify')->assertOk();

        $otp = PasswordOtp::where('email', $user->email)->first();
        $otp->update(['code_hash' => Hash::make('123456')]);

        $this->post('/forgot-password/verify', ['code' => '123456'])
            ->assertRedirect(route('password.reset'));

        $this->get('/reset-password')->assertOk();

        $this->post('/reset-password', [
            'password' => 'Newpass1!',
            'password_confirmation' => 'Newpass1!',
        ])->assertRedirect(route('login'));

        $user->refresh();
        $this->assertTrue(Hash::check('Newpass1!', $user->password));
    }
}
