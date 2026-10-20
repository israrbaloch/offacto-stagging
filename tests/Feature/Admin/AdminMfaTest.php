<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\UserMfaCredential;
use App\Services\AdminMfaService;
use App\Services\TotpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class AdminMfaTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    public function test_admin_dashboard_is_reachable_when_mfa_is_not_required(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->post('/admin/mfa/verify', ['code' => '000000'])->assertRedirect();
    }

    public function test_unenrolled_admin_is_sent_to_enroll_when_mfa_required(): void
    {
        SiteSetting::set('sec_mfa_required_admin', '1', 'boolean');
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/admin')->assertRedirect(route('admin.mfa.enroll'));
    }

    public function test_enrolled_admin_must_pass_challenge_before_admin_routes(): void
    {
        SiteSetting::set('sec_mfa_required_admin', '1', 'boolean');
        $admin = $this->makeAdmin();
        $totp = app(TotpService::class);
        $secret = $totp->generateSecret();
        UserMfaCredential::create([
            'user_id' => $admin->id,
            'secret' => $secret,
            'recovery_codes' => [Hash::make('ABCD-EFGH')],
            'confirmed_at' => now(),
        ]);

        $this->actingAs($admin)->get('/admin')->assertRedirect(route('admin.mfa'));

        $this->actingAs($admin)->post('/admin/mfa/verify', ['code' => '000000'])->assertSessionHasErrors('code');
        $this->actingAs($admin)->get('/admin')->assertRedirect(route('admin.mfa'));

        $this->actingAs($admin)->post('/admin/mfa/verify', ['code' => $totp->currentCode($secret)])->assertRedirect();
        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_recovery_code_is_single_use_and_forces_reenroll(): void
    {
        SiteSetting::set('sec_mfa_required_admin', '1', 'boolean');
        $admin = $this->makeAdmin();
        $totp = app(TotpService::class);
        UserMfaCredential::create([
            'user_id' => $admin->id,
            'secret' => $totp->generateSecret(),
            'recovery_codes' => [Hash::make('ABCD-EFGH')],
            'confirmed_at' => now(),
        ]);

        $this->actingAs($admin)->post('/admin/mfa/recover', ['recovery_code' => 'ABCD-EFGH'])->assertRedirect(route('admin.mfa.enroll'));
        $this->actingAs($admin)->get('/admin')->assertRedirect(route('admin.mfa.enroll'));
        $this->actingAs($admin)->post('/admin/mfa/recover', ['recovery_code' => 'ABCD-EFGH'])->assertSessionHasErrors('recovery_code');
    }

    public function test_enrollment_requires_password_and_valid_code(): void
    {
        $admin = $this->makeAdmin(['password' => 'password']);

        $this->actingAs($admin)->post('/admin/mfa/enroll/start', ['password' => 'wrong'])->assertSessionHasErrors('password');
        $this->actingAs($admin)->post('/admin/mfa/enroll/start', ['password' => 'password'])->assertRedirect();

        $secret = session(AdminMfaService::SESSION_PENDING_SECRET);
        $this->assertNotEmpty($secret);

        $this->actingAs($admin)->post('/admin/mfa/enroll/confirm', ['code' => '000000'])->assertSessionHasErrors('code');
        $code = app(TotpService::class)->currentCode($secret);
        $this->actingAs($admin)->post('/admin/mfa/enroll/confirm', ['code' => $code])->assertRedirect();
        $this->assertDatabaseHas('user_mfa_credentials', ['user_id' => $admin->id]);
    }
}
