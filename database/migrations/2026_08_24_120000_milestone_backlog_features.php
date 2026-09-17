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
        Schema::create('invoice_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->timestamps();
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->string('share_token', 64)->nullable()->unique()->after('status');
            $table->timestamp('accepted_at')->nullable()->after('share_token');
            $table->timestamp('declined_at')->nullable()->after('accepted_at');
            $table->text('signature_data')->nullable()->after('declined_at');
            $table->string('voice_note_path')->nullable()->after('signature_data');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('billing_mode', 20)->default('fixed')->after('price');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('payment_status');
            $table->string('recurring_interval')->nullable()->after('is_recurring');
            $table->date('next_run_at')->nullable()->after('recurring_interval');
            $table->foreignId('parent_invoice_id')->nullable()->after('next_run_at')->constrained('invoices')->nullOnDelete();
            $table->timestamp('peppol_sent_at')->nullable()->after('parent_invoice_id');
            $table->string('mollie_payment_id')->nullable()->after('peppol_sent_at');
            $table->string('mollie_checkout_url')->nullable()->after('mollie_payment_id');
        });

        Schema::create('offer_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->unsignedInteger('sort_order')->default(0);
            $table->json('content')->nullable();
            $table->timestamps();
        });

        foreach (DB::table('offers')->whereNull('share_token')->pluck('id') as $offerId) {
            DB::table('offers')->where('id', $offerId)->update(['share_token' => Str::random(40)]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('offer_blocks');
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_invoice_id');
            $table->dropColumn([
                'is_recurring',
                'recurring_interval',
                'next_run_at',
                'peppol_sent_at',
                'mollie_payment_id',
                'mollie_checkout_url',
            ]);
        });
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('billing_mode');
        });
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn(['share_token', 'accepted_at', 'declined_at', 'signature_data', 'voice_note_path']);
        });
        Schema::dropIfExists('invoice_attachments');
    }
};
