<?php

use App\Support\SiteSettingSecrets;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('site_settings')) {
            return;
        }

        foreach (SiteSettingSecrets::keys() as $key) {
            $row = DB::table('site_settings')->where('key', $key)->first();
            if (! $row || $row->value === null || $row->value === '') {
                continue;
            }
            if (SiteSettingSecrets::isEncrypted($row->value)) {
                continue;
            }

            DB::table('site_settings')->where('id', $row->id)->update([
                'value' => SiteSettingSecrets::encrypt($row->value),
            ]);
        }
    }

    public function down(): void
    {
        // Leave values encrypted. Rolling back would write secrets in plaintext.
    }
};
