<?php

use App\Models\Company;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_started_at');
            $table->boolean('subscription_cancel_at_period_end')->default(false)->after('subscription_ends_at');
            $table->timestamp('trial_expiry_reminder_sent_at')->nullable()->after('subscription_cancel_at_period_end');
            $table->timestamp('subscription_expiry_reminder_sent_at')->nullable()->after('trial_expiry_reminder_sent_at');
        });

        Company::query()
            ->whereNotNull('subscription_plan')
            ->whereNull('subscription_ends_at')
            ->each(function (Company $company) {
                $start = $company->subscription_started_at ?? now();
                $company->update([
                    'subscription_ends_at' => $start->copy()->addMonth(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'subscription_ends_at',
                'subscription_cancel_at_period_end',
                'trial_expiry_reminder_sent_at',
                'subscription_expiry_reminder_sent_at',
            ]);
        });
    }
};
