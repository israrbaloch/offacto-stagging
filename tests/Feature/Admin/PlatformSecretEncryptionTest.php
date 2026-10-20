<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Support\SiteSettingSecrets;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlatformSecretEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_sensitive_settings_are_encrypted_at_rest_and_decrypt_on_read(): void
    {
        SiteSetting::set('int_smtp_password', 'smtp-plain-secret');

        $raw = DB::table('site_settings')->where('key', 'int_smtp_password')->value('value');
        $this->assertTrue(SiteSettingSecrets::isEncrypted($raw));
        $this->assertStringNotContainsString('smtp-plain-secret', (string) $raw);
        $this->assertSame('smtp-plain-secret', SiteSetting::get('int_smtp_password'));
    }

    public function test_legacy_plaintext_can_still_be_read_and_is_encrypted_on_next_write(): void
    {
        DB::table('site_settings')->insert([
            'key' => 'int_postmark_token',
            'value' => 'legacy-token',
            'type' => 'string',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertSame('legacy-token', SiteSetting::get('int_postmark_token'));

        SiteSetting::set('int_postmark_token', 'legacy-token');
        $raw = DB::table('site_settings')->where('key', 'int_postmark_token')->value('value');
        $this->assertTrue(SiteSettingSecrets::isEncrypted($raw));
        $this->assertSame('legacy-token', SiteSetting::get('int_postmark_token'));
    }

    public function test_empty_password_is_not_encrypted_as_noise(): void
    {
        SiteSetting::set('int_resend_api_key', '');
        $raw = DB::table('site_settings')->where('key', 'int_resend_api_key')->value('value');
        $this->assertSame('', $raw);
    }
}
