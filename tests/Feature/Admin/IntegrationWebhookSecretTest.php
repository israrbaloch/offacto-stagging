<?php

namespace Tests\Feature\Admin;

use App\Models\IntegrationWebhook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class IntegrationWebhookSecretTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    public function test_signing_secret_is_not_serialized_to_inertia(): void
    {
        $admin = $this->makeAdmin();
        IntegrationWebhook::create([
            'name' => 'Billing',
            'url' => 'https://example.test/hooks',
            'events' => ['invoice.paid'],
            'signing_secret' => 'super-secret-value',
            'active' => true,
        ]);

        $this->actingAs($admin)
            ->get('/admin/integrations/operations/webhooks')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Integrations/Operation')
                ->has('webhooks.0', fn (Assert $webhook) => $webhook
                    ->where('name', 'Billing')
                    ->where('signing_secret_set', true)
                    ->missing('signing_secret')
                    ->etc()
                )
            );

        $json = $this->actingAs($admin)
            ->get('/admin/integrations/operations/webhooks')
            ->assertOk()
            ->getContent();

        $this->assertStringNotContainsString('super-secret-value', $json);
    }
}
