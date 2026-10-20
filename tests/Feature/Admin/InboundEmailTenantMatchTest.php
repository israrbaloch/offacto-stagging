<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSetting;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\InteractsWithAdmin;
use Tests\TestCase;

class InboundEmailTenantMatchTest extends TestCase
{
    use RefreshDatabase;
    use InteractsWithAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        SiteSetting::set('comm_inbound_enabled', '1', 'boolean');
        SiteSetting::set('comm_inbound_webhook_secret', 'inbound-secret');
        SiteSetting::set('comm_inbound_create_tickets', '1', 'boolean');
    }

    public function test_query_string_secret_is_rejected(): void
    {
        $this->post('/webhooks/inbound-email?secret=inbound-secret', [
            'from' => 'a@example.test',
            'subject' => 'Hello',
            'text' => 'Hi',
        ])->assertUnauthorized();
    }

    public function test_missing_header_secret_is_rejected(): void
    {
        $this->postJson('/webhooks/inbound-email', [
            'from' => 'a@example.test',
            'subject' => 'Hello',
            'text' => 'Hi',
        ])->assertUnauthorized();
    }

    public function test_authorized_sender_can_reply_using_ticket_reference(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.test']);
        $company = $this->makeCompany($owner, ['email' => 'acme@example.test']);
        $ticket = SupportTicket::create([
            'reference' => 'TKT-ABC123',
            'subject' => 'Help',
            'status' => SupportTicket::STATUS_OPEN,
            'company_id' => $company->id,
            'customer_user_id' => $owner->id,
        ]);

        $this->postJson('/webhooks/inbound-email', [
            'from' => 'acme@example.test',
            'subject' => 'Re: TKT-ABC123',
            'text' => 'Follow up',
        ], ['X-Inbound-Secret' => 'inbound-secret'])->assertOk();

        $this->assertDatabaseHas('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'body' => 'Follow up',
        ]);
    }

    public function test_cross_company_reference_injection_is_rejected(): void
    {
        $owner = User::factory()->create();
        $company = $this->makeCompany($owner, ['email' => 'acme@example.test']);
        $ticket = SupportTicket::create([
            'reference' => 'TKT-SECRET1',
            'subject' => 'Help',
            'status' => SupportTicket::STATUS_OPEN,
            'company_id' => $company->id,
        ]);

        $this->postJson('/webhooks/inbound-email', [
            'from' => 'attacker@example.test',
            'subject' => 'Re: TKT-SECRET1',
            'text' => 'Injected',
        ], ['X-Inbound-Secret' => 'inbound-secret'])->assertForbidden();

        $this->assertDatabaseMissing('support_ticket_messages', [
            'support_ticket_id' => $ticket->id,
            'body' => 'Injected',
        ]);
    }

    public function test_unknown_sender_can_still_open_a_new_ticket(): void
    {
        $this->postJson('/webhooks/inbound-email', [
            'from' => 'new.customer@example.test',
            'subject' => 'Need help',
            'text' => 'Hello',
        ], ['X-Inbound-Secret' => 'inbound-secret'])->assertCreated();

        $this->assertDatabaseHas('support_tickets', [
            'subject' => 'Need help',
            'category' => 'email',
        ]);
    }
}
