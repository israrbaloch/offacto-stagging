<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketMessage;
use App\Services\SupportTicketNotifier;
use App\Support\SupportPolicy;
use App\Support\SupportReference;
use App\Support\SupportSettings;
use App\Support\SupportTicketAttachmentHandler;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SupportTicketController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): InertiaResponse|RedirectResponse
    {
        if (! SupportSettings::customerPortalEnabled()) {
            return Inertia::render('Support/Disabled');
        }

        $user = $request->user();
        $company = $user->activeCompany();

        if (! $company) {
            return Inertia::render('Support/NoCompany');
        }

        $tickets = SupportTicket::query()
            ->where('company_id', $company->id)
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get(['id', 'reference', 'subject', 'status', 'priority', 'updated_at', 'created_at']);

        return Inertia::render('Support/Tickets/Index', [
            'tickets' => $tickets->map(fn (SupportTicket $t) => [
                'id' => $t->id,
                'reference' => $t->reference,
                'subject' => $t->subject,
                'status' => $t->status,
                'priority' => $t->priority,
                'updated_at' => $t->updated_at->toIso8601String(),
                'created_at' => $t->created_at->toIso8601String(),
            ]),
            'company' => ['id' => $company->id, 'name' => $company->company_name],
            'filters' => [
                'drawer' => $request->query('drawer') === 'new' ? 'new' : null,
            ],
        ]);
    }

    public function store(Request $request, SupportTicketNotifier $notifier): RedirectResponse
    {
        if (! SupportSettings::customerPortalEnabled()) {
            abort(403);
        }

        $user = $request->user();
        $company = $user->activeCompany();
        if (! $company) {
            return back()->with('error', 'no-company');
        }

        $data = $request->validate(array_merge([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'priority' => ['required', Rule::in(['urgent', 'high', 'normal', 'low'])],
        ], SupportTicketAttachmentHandler::validationRules()));

        $hours = SupportPolicy::slaHoursForPriority($data['priority']);
        $ticket = SupportTicket::create([
            'reference' => SupportReference::make('TKT'),
            'subject' => $data['subject'],
            'description' => $data['description'],
            'status' => SupportTicket::STATUS_OPEN,
            'priority' => $data['priority'],
            'category' => 'customer',
            'company_id' => $company->id,
            'customer_user_id' => $user->id,
            'created_by_user_id' => $user->id,
            'sla_due_at' => now()->addHours($hours),
        ]);

        $message = SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $data['description'],
            'is_internal' => false,
        ]);

        SupportTicketAttachmentHandler::persist($ticket, $message, $request);

        $notifier->notify('new_ticket', $ticket, [
            'snippet' => Str::limit($data['description'], 240),
            'source' => 'customer_portal',
        ]);

        return redirect()->route('support.tickets.show', $ticket);
    }

    public function show(Request $request, SupportTicket $ticket): InertiaResponse
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'messages' => fn ($q) => $q->where('is_internal', false)->with(['user:id,name', 'attachments']),
        ]);

        return Inertia::render('Support/Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'reference' => $ticket->reference,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'created_at' => $ticket->created_at->toIso8601String(),
            ],
            'messages' => $ticket->messages->map(fn (SupportTicketMessage $m) => [
                'id' => $m->id,
                'body' => $m->body,
                'author' => $m->user_id === $request->user()->id ? 'You' : ($m->user?->name ?? 'Support team'),
                'is_staff' => $m->user_id !== $ticket->customer_user_id,
                'created_at' => $m->created_at->toIso8601String(),
                'attachments' => SupportTicketAttachmentHandler::serializeForTicket($ticket, $m->attachments),
            ]),
        ]);
    }

    public function showAttachment(Request $request, SupportTicket $ticket, SupportTicketAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $ticket);

        $attachment->loadMissing('message');
        if ($attachment->message?->support_ticket_id !== $ticket->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->response(
            $attachment->file_path,
            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type],
        );
    }

    public function storeMessage(Request $request, SupportTicket $ticket, SupportTicketNotifier $notifier): RedirectResponse
    {
        $this->authorize('reply', $ticket);

        $data = $request->validate(array_merge([
            'body' => ['required', 'string', 'max:10000'],
        ], SupportTicketAttachmentHandler::validationRules()));

        $message = SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => $data['body'],
            'is_internal' => false,
        ]);

        SupportTicketAttachmentHandler::persist($ticket, $message, $request);

        $ticket->update(['status' => SupportTicket::STATUS_OPEN]);

        $notifier->notify('customer_reply', $ticket, [
            'snippet' => Str::limit($data['body'], 240),
            'source' => 'customer_portal',
        ]);

        return back();
    }
}
