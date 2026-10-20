<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Services\SupportTicketNotifier;
use App\Support\SupportPolicy;
use App\Support\SupportReference;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InboundEmailWebhookController extends Controller
{
    public function __invoke(Request $request, SupportTicketNotifier $notifier): Response
    {
        if (! \App\Models\SiteSetting::getBoolean('comm_inbound_enabled', false)) {
            return response('Inbound email disabled', 403);
        }

        $secret = \App\Models\SiteSetting::get('comm_inbound_webhook_secret');
        $provided = $request->header('X-Inbound-Secret')
            ?? $request->header('X-Webhook-Secret');

        if (! filled($secret) || ! is_string($provided) || ! hash_equals((string) $secret, $provided)) {
            $this->logRejection('unauthorized', $request);

            return response('Unauthorized', 401);
        }

        [$from, $subject, $body] = $this->parsePayload($request);

        if (! filled($from) || ! filter_var($from, FILTER_VALIDATE_EMAIL)) {
            $this->logRejection('invalid_sender', $request);

            return response('Invalid sender', 422);
        }

        $from = strtolower(trim($from));
        $ticket = $this->findAuthorizedOpenTicket($from, $subject);

        if ($ticket === 'forbidden') {
            $this->logRejection('tenant_mismatch', $request, $subject);

            return response('Sender is not authorized for this ticket', 403);
        }

        if ($ticket) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => null,
                'body' => $body ?: '(empty message)',
                'is_internal' => false,
            ]);
            $ticket->update(['status' => SupportTicket::STATUS_OPEN]);
            ActivityLog::record('support.inbound_email.reply', subject: $ticket, metadata: [
                'from_hash' => hash('sha256', $from),
            ]);
            $notifier->notify('customer_reply', $ticket, ['snippet' => Str::limit($body, 240)]);

            return response('Reply recorded', 200);
        }

        if (! \App\Models\SiteSetting::getBoolean('comm_inbound_create_tickets', true)) {
            return response('No matching ticket', 404);
        }

        $company = Company::query()->whereRaw('LOWER(email) = ?', [$from])->first();

        $ticket = SupportTicket::create([
            'reference' => SupportReference::make('TKT'),
            'subject' => filled($subject) ? Str::limit($subject, 255) : 'Email from customer',
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

        ActivityLog::record('support.inbound_email.ticket', subject: $ticket, metadata: [
            'from_hash' => hash('sha256', $from),
        ]);
        $notifier->notify('new_ticket', $ticket, ['snippet' => Str::limit($body, 240)]);

        return response('Ticket created', 201);
    }

    /**
     * @return array{0: ?string, 1: ?string, 2: string}
     */
    protected function parsePayload(Request $request): array
    {
        $data = $request->all();

        if (isset($data['FromFull']['Email'])) {
            return [
                $data['FromFull']['Email'],
                $data['Subject'] ?? null,
                trim($data['TextBody'] ?? strip_tags($data['HtmlBody'] ?? '')),
            ];
        }

        $from = $data['from'] ?? $data['sender'] ?? $data['email'] ?? null;
        $subject = $data['subject'] ?? null;
        $body = trim($data['text'] ?? $data['body'] ?? $data['message'] ?? strip_tags($data['html'] ?? ''));

        return [$from, $subject, $body];
    }

    /**
     * @return SupportTicket|'forbidden'|null
     */
    protected function findAuthorizedOpenTicket(string $from, ?string $subject): SupportTicket|string|null
    {
        $ref = null;
        if ($subject && preg_match('/TKT-[A-Z0-9-]+/i', $subject, $m)) {
            $ref = strtoupper($m[0]);
        }

        if ($ref) {
            $byRef = SupportTicket::query()
                ->with(['company.user', 'customerUser'])
                ->where('reference', $ref)
                ->whereNotIn('status', ['closed'])
                ->first();

            if ($byRef) {
                return $this->senderMayReply($byRef, $from) ? $byRef : 'forbidden';
            }
        }

        $company = Company::query()->whereRaw('LOWER(email) = ?', [$from])->first();
        if (! $company) {
            return null;
        }

        return SupportTicket::query()
            ->where('company_id', $company->id)
            ->whereIn('status', ['open', 'pending'])
            ->orderByDesc('updated_at')
            ->first();
    }

    protected function senderMayReply(SupportTicket $ticket, string $from): bool
    {
        $allowed = [];
        $company = $ticket->company;
        if ($company?->email) {
            $allowed[] = strtolower($company->email);
        }
        if ($company?->user?->email) {
            $allowed[] = strtolower($company->user->email);
        }
        if ($ticket->customerUser?->email) {
            $allowed[] = strtolower($ticket->customerUser->email);
        }

        return in_array($from, array_values(array_unique($allowed)), true);
    }

    protected function logRejection(string $reason, Request $request, ?string $subject = null): void
    {
        $ref = null;
        if ($subject && preg_match('/TKT-[A-Z0-9-]+/i', $subject, $m)) {
            $ref = strtoupper($m[0]);
        }

        Log::info('inbound_email.rejected', [
            'reason' => $reason,
            'ticket_ref' => $ref,
        ]);
    }
}
