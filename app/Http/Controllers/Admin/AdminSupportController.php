<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CustomerFeedback;
use App\Models\SupportAccessRequest;
use App\Models\SupportEscalation;
use App\Models\SupportKnowledgeArticle;
use App\Models\SupportMacro;
use App\Models\SupportRecoveryRequest;
use App\Models\AdminNotification;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Services\PlatformSettingsService;
use App\Services\SupportTicketNotifier;
use App\Support\AdminSupportInsights;
use App\Support\SupportPolicy;
use App\Support\SupportReference;
use App\Support\SupportSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminSupportController extends Controller
{
    private const REGISTRY = SupportSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        AdminSupportInsights::seedKnowledgeDefaults();

        $sections = SupportSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Support/Index', [
            'metrics' => AdminSupportInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function ticketsIndex(): InertiaResponse
    {
        return Inertia::render('Admin/Support/Tickets/Index', [
            'tickets' => AdminSupportInsights::ticketList(),
            'admins' => AdminSupportInsights::adminUsers(),
            'companies' => Company::query()->orderBy('company_name')->limit(200)->get(['id', 'company_name']),
        ]);
    }

    public function ticketShow(SupportTicket $ticket): InertiaResponse
    {
        $ticket->load(['company:id,company_name,email', 'assignedTo:id,name', 'messages.user:id,name']);

        AdminNotification::query()
            ->where('user_id', auth()->id())
            ->whereNull('read_at')
            ->where('href', '/admin/support/tickets/'.$ticket->id)
            ->update(['read_at' => now()]);

        return Inertia::render('Admin/Support/Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'reference' => $ticket->reference,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'category' => $ticket->category,
                'company' => $ticket->company,
                'assignee' => $ticket->assignedTo,
                'sla_due_at' => $ticket->sla_due_at?->toIso8601String(),
                'resolved_at' => $ticket->resolved_at?->toIso8601String(),
                'created_at' => $ticket->created_at->toIso8601String(),
            ],
            'messages' => $ticket->messages->map(fn (SupportTicketMessage $m) => [
                'id' => $m->id,
                'body' => $m->body,
                'is_internal' => $m->is_internal,
                'author' => $m->user?->name ?? 'System',
                'created_at' => $m->created_at->toIso8601String(),
            ]),
            'timeline' => $ticket->company_id
                ? AdminSupportInsights::companyTimeline($ticket->company_id, 25)
                : [],
            'admins' => AdminSupportInsights::adminUsers(),
            'macros' => SupportMacro::query()->orderBy('title')->get(['id', 'title', 'body']),
        ]);
    }

    public function storeTicket(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', Rule::in(['urgent', 'high', 'normal', 'low'])],
            'category' => ['required', 'string', 'max:64'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
        ]);

        $hours = SupportPolicy::slaHoursForPriority($data['priority']);
        $ticket = SupportTicket::create([
            'reference' => SupportReference::make('TKT'),
            ...$data,
            'status' => SupportTicket::STATUS_OPEN,
            'created_by_user_id' => $request->user()->id,
            'sla_due_at' => now()->addHours($hours),
        ]);

        ActivityLog::record('admin.support.ticket.created', subject: $ticket, metadata: ['reference' => $ticket->reference]);

        app(SupportTicketNotifier::class)->notify('new_ticket', $ticket);

        return redirect()->route('admin.support.tickets.show', $ticket);
    }

    public function updateTicket(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'pending', 'resolved', 'closed'])],
            'priority' => ['nullable', Rule::in(['urgent', 'high', 'normal', 'low'])],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
        ]);

        if (isset($data['status']) && in_array($data['status'], ['resolved', 'closed'], true)) {
            $ticket->resolved_at = now();
        }
        $previousAssignee = $ticket->assigned_to_user_id;
        $ticket->fill(array_filter($data, fn ($v) => $v !== null));
        $assignedChanged = array_key_exists('assigned_to_user_id', $data)
            && $data['assigned_to_user_id'] != $previousAssignee;
        $ticket->save();

        ActivityLog::record('admin.support.ticket.updated', subject: $ticket);

        if ($assignedChanged) {
            app(SupportTicketNotifier::class)->notify('assigned', $ticket);
        }

        return back();
    }

    public function storeMessage(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['boolean'],
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => $data['body'],
            'is_internal' => $request->boolean('is_internal'),
        ]);

        if (! $ticket->first_response_at && ! $request->boolean('is_internal')) {
            $ticket->update(['first_response_at' => now()]);
        }

        if (! $request->boolean('is_internal')) {
            app(SupportTicketNotifier::class)->notify('staff_reply', $ticket, [
                'snippet' => \Illuminate\Support\Str::limit($data['body'], 240),
            ]);
        }

        return back();
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (SupportSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.support.operation', $section);
        }

        $def = SupportSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Support/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => SupportSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (SupportSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.support.updated');

        return back()->with('status', 'support-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.support.reset');

        return back()->with('status', 'support-settings-reset');
    }

    public function operation(string $section, Request $request): InertiaResponse
    {
        if (! SupportSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        AdminSupportInsights::seedKnowledgeDefaults();

        $meta = collect(SupportSettingsRegistry::operationSections())->firstWhere('id', $section);
        $companyId = $request->integer('company_id') ?: null;

        $payload = match ($section) {
            'access-approvals' => [
                'requests' => SupportAccessRequest::query()->with(['company:id,company_name'])->orderByDesc('created_at')->limit(50)->get(),
                'companies' => Company::query()->orderBy('company_name')->limit(100)->get(['id', 'company_name']),
            ],
            'activity-timeline' => [
                'companyId' => $companyId,
                'companies' => Company::query()->orderBy('company_name')->limit(100)->get(['id', 'company_name']),
                'timeline' => AdminSupportInsights::companyTimeline($companyId),
            ],
            'account-recovery' => [
                'recoveries' => SupportRecoveryRequest::query()->with('user:id,name,email')->orderByDesc('created_at')->limit(50)->get(),
                'users' => User::query()->orderBy('name')->limit(100)->get(['id', 'name', 'email']),
            ],
            'macros-knowledge' => [
                'macros' => SupportMacro::query()->orderBy('title')->get(),
                'articles' => SupportKnowledgeArticle::query()->orderBy('title')->get(),
            ],
            'feedback' => [
                'feedback' => CustomerFeedback::query()->with(['company:id,company_name'])->orderByDesc('created_at')->limit(50)->get(),
            ],
            'escalations' => [
                'escalations' => SupportEscalation::query()->with('ticket:id,reference,subject')->orderByDesc('created_at')->limit(50)->get(),
                'tickets' => SupportTicket::query()->whereIn('status', ['open', 'pending'])->limit(50)->get(['id', 'reference', 'subject']),
            ],
            default => [],
        };

        return Inertia::render('Admin/Support/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => SupportSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function storeAccessRequest(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'company_id' => ['required', 'exists:companies,id'],
            'reason' => ['required', 'string'],
            'scope' => ['required', Rule::in(['read_only_context', 'billing_review', 'technical_diagnostics'])],
        ]);

        SupportAccessRequest::create([
            'reference' => SupportReference::make('ACC'),
            'company_id' => $data['company_id'],
            'requested_by_user_id' => $request->user()->id,
            'reason' => $data['reason'],
            'scope' => $data['scope'],
            'status' => 'pending',
        ]);

        ActivityLog::record('admin.support.access_requested', metadata: $data);

        return back()->with('status', 'support-access-requested');
    }

    public function approveAccess(Request $request, SupportAccessRequest $accessRequest): RedirectResponse
    {
        $request->validate([
            'confirm' => ['accepted'],
            'no_impersonation_ack' => ['accepted'],
        ]);

        $accessRequest->update([
            'status' => 'approved',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'expires_at' => now()->addHours(8),
        ]);

        ActivityLog::record('admin.support.access_approved', subject: $accessRequest, metadata: [
            'note' => 'Approval documents context review only — no impersonation or password bypass.',
        ]);

        return back()->with('status', 'support-access-approved');
    }

    public function storeRecovery(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'verification_method' => ['required', 'string', 'max:64'],
            'notes' => ['nullable', 'string'],
        ]);

        $user = User::findOrFail($data['user_id']);
        SupportRecoveryRequest::create([
            'reference' => SupportReference::make('RCV'),
            'user_id' => $user->id,
            'company_id' => $user->activeCompany()?->id,
            'status' => 'intake',
            'verification_method' => $data['verification_method'],
            'notes' => $data['notes'] ?? null,
            'handled_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.support.recovery.intake', metadata: ['user_id' => $user->id]);

        return back()->with('status', 'support-recovery-created');
    }

    public function updateRecovery(Request $request, SupportRecoveryRequest $recovery): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['intake', 'verification', 'guidance_sent', 'resolved', 'rejected'])],
            'notes' => ['nullable', 'string'],
        ]);

        $recovery->fill($data);
        if ($data['status'] === 'resolved') {
            $recovery->resolved_at = now();
        }
        $recovery->save();

        return back();
    }

    public function storeMacro(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:64'],
            'body' => ['required', 'string'],
            'shortcut' => ['nullable', 'string', 'max:32'],
        ]);

        SupportMacro::create($data);

        return back()->with('status', 'support-macro-saved');
    }

    public function storeArticle(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:128', Rule::unique('support_knowledge_articles', 'slug')],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:64'],
            'body' => ['required', 'string'],
        ]);

        SupportKnowledgeArticle::create([...$data, 'published' => true]);

        return back()->with('status', 'support-article-saved');
    }

    public function storeFeedback(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'feedback_type' => ['required', Rule::in(['feature_request', 'complaint', 'satisfaction', 'other'])],
            'company_id' => ['nullable', 'exists:companies,id'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string'],
        ]);

        CustomerFeedback::create([...$data, 'status' => 'new']);

        return back()->with('status', 'support-feedback-saved');
    }

    public function updateFeedback(Request $request, CustomerFeedback $feedback): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['new', 'reviewing', 'closed'])],
        ]);
        $feedback->update($data);

        return back();
    }

    public function storeEscalation(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'support_ticket_id' => ['nullable', 'exists:support_tickets,id'],
            'escalation_type' => ['required', Rule::in(['billing_dispute', 'fraud', 'privacy', 'legal', 'other'])],
            'assigned_team' => ['required', 'string', 'max:64'],
            'summary' => ['required', 'string'],
        ]);

        $esc = SupportEscalation::create([...$data, 'status' => 'open']);
        ActivityLog::record('admin.support.escalation.created', subject: $esc);

        return back()->with('status', 'support-escalation-created');
    }
}
