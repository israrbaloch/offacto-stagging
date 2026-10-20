<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class ProductionSafeguardTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    public function test_environment_label_cannot_disable_production_job_retry_block(): void
    {
        $admin = $this->makeAdmin();
        SiteSetting::set('gov_environment_label', 'staging');
        SiteSetting::set('gov_block_destructive_in_production', '1', 'boolean');
        $this->app['env'] = 'production';

        $uuid = (string) Str::uuid();
        DB::table('failed_jobs')->insert([
            'uuid' => $uuid,
            'connection' => 'database',
            'queue' => 'default',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\SafeHousekeeping']),
            'exception' => 'fail',
            'failed_at' => now(),
        ]);

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        $this->actingAs($admin)
            ->from('/admin/infrastructure/operations/failed-jobs')
            ->post('/admin/infrastructure/failed-jobs/retry', [
                'uuid' => $uuid,
                'confirm' => true,
                'duplicate_ack' => true,
            ])
            ->assertForbidden();
    }

    public function test_mail_jobs_cannot_be_retried(): void
    {
        $admin = $this->makeAdmin();
        $uuid = (string) Str::uuid();
        DB::table('failed_jobs')->insert([
            'uuid' => $uuid,
            'connection' => 'database',
            'queue' => 'default',
            'payload' => json_encode([
                'displayName' => 'App\\Mail\\InvoiceSent',
                'data' => ['commandName' => 'Illuminate\\Mail\\SendQueuedMailable'],
            ]),
            'exception' => 'fail',
            'failed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->from('/admin/infrastructure/operations/failed-jobs')
            ->post('/admin/infrastructure/failed-jobs/retry', [
                'uuid' => $uuid,
                'confirm' => true,
                'duplicate_ack' => true,
            ])
            ->assertSessionHasErrors('uuid');
    }
}
