<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('share_token', 64)->nullable()->unique()->after('mollie_checkout_url');
            $table->timestamp('customer_acknowledged_at')->nullable()->after('share_token');
            $table->longText('signature_data')->nullable()->after('customer_acknowledged_at');
            $table->string('voice_note_path')->nullable()->after('signature_data');
        });

        foreach (DB::table('invoices')->whereNull('share_token')->pluck('id') as $invoiceId) {
            DB::table('invoices')->where('id', $invoiceId)->update(['share_token' => Str::random(40)]);
        }
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['share_token', 'customer_acknowledged_at', 'signature_data', 'voice_note_path']);
        });
    }
};
