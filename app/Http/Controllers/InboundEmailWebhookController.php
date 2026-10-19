<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SiteSetting;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Services\SupportTicketNotifier;
use App\Support\SupportPolicy;
use App\Support\SupportReference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class InboundEmailWebhookController extends Controller
{
    public function __invoke(Request $request, SupportTicketNotifier $notifier): Response
    {
        if (! SiteSetting::getBoolean('comm_inbound_enabled', false)) {
            return response('Inbound email disabled', 403);
        }

        $secret = SiteSetting::get('comm_inbound_webhook_secret');
        $provided = $request->header('X-Inbound-Secret')
            ?? $request->header('X-Webhook-Secret')
            ?? $request->query('secret');
        if (! filled($secret) || ! hash_equals((string) $secret, (string) $provided)) {
            return response('Unauthorized', 401);
        }

        [$from, $subject, $body] = $this->parsePayload($request);

        if (! filled($from) || ! filter_var($from, FILTER_VALIDATE_EMAIL)) {
            return response('Invalid sender', 422);
        }

        $company = Company::query()->where('email', $from)->first();
        $ticket = $this->findOpenTicket($from, $subject);

        if ($ticket) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => null,
                'body' => $body ?: '(empty message)',
                'is_internal' => false,
            ]);
            $ticket->update(['status' => SupportTicket::STATUS_OPEN]);
            ActivityLog::record('support.inbound_email.reply', subject: $ticket, metadata: ['from' => $from]);
            $notifier->notify('customer_reply', $ticket, ['snippet' => Str::limit($body, 240)]);

            return response('Reply recorded', 200);
        }

        if (! SiteSetting::getBoolean('comm_inbound_create_tickets', true)) {
            return response('No matching ticket', 404);
        }

        $ticket = SupportTicket::create([
            'reference' => SupportReference::make('TKT'),
            'subject' => filled($subject) ? Str::limit($subject, 255) : 'Email from '.$from,
            'description' => $body,
            'status' => SupportTicket::STATUS_OPEN,
            'priority' => 'normal',
            'category' => 'email',
            'company_id' => $company?->id,
            'sla_due_at' => now()->addHours(SupportPolicy::slaHoursForPriority('normal')),
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => null,
            'body' => $body ?: '(empty message)',
            'is_internal' => false,
        ]);

        ActivityLog::record('support.inbound_email.ticket', subject: $ticket, metadata: ['from' => $from]);
        $notifier->notify('new_ticket', $ticket, ['snippet' => Str::limit($body, 240)]);

        return response('Ticket created', 201);
    }

    /**
     * @return array{0: ?string, 1: ?string, 2: string}
     */
    protected function parsePayload(Request $request): array
    {
        $data = $request->all();

        // Postmark inbound
        if (isset($data['FromFull']['Email'])) {
            return [
                $data['FromFull']['Email'],
                $data['Subject'] ?? null,
                trim($data['TextBody'] ?? strip_tags($data['HtmlBody'] ?? '')),
            ];
        }

        // Generic JSON
        $from = $data['from'] ?? $data['sender'] ?? $data['email'] ?? null;
        $subject = $data['subject'] ?? null;
        $body = trim($data['text'] ?? $data['body'] ?? $data['message'] ?? strip_tags($data['html'] ?? ''));

        return [$from, $subject, $body];
    }

    protected function findOpenTicket(string $from, ?string $subject): ?SupportTicket
    {
        $ref = null;
        if ($subject && preg_match('/TKT-[A-Z0-9-]+/i', $subject, $m)) {
            $ref = strtoupper($m[0]);
        }

        if ($ref) {
            $byRef = SupportTicket::query()->where('reference', $ref)->whereNotIn('status', ['closed'])->first();
            if ($byRef) {
                return $byRef;
            }
        }

        $company = Company::query()->where('email', $from)->first();
        if (! $company) {
            return null;
        }

        return SupportTicket::query()
            ->where('company_id', $company->id)
            ->whereIn('status', ['open', 'pending'])
            ->orderByDesc('updated_at')
            ->first();
    }
}
