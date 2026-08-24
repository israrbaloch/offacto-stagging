<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->timestamp('trial_starts_at')->nullable()->after('approved_by');
            $table->timestamp('trial_ends_at')->nullable()->after('trial_starts_at');
        });

        foreach (DB::table('companies')->get() as $company) {
            $start = $company->created_at ?: now();
            DB::table('companies')->where('id', $company->id)->update([
                'trial_starts_at' => $start,
                'trial_ends_at' => \Carbon\Carbon::parse($start)->addDays(14),
            ]);
        }

        Schema::create('company_legal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('other');
            $table->string('file_path');
            $table->string('original_name');
            $table->boolean('attach_to_quotes_default')->default(false);
            $table->timestamps();
        });

        Schema::create('offer_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->timestamps();
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->longText('email_message')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn('email_message');
        });
        Schema::dropIfExists('offer_attachments');
        Schema::dropIfExists('company_legal_documents');
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['trial_starts_at', 'trial_ends_at']);
        });
    }
};
