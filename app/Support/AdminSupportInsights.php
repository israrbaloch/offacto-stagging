<?php

namespace App\Support;

use App\Models\CommunicationDeliveryLog;
use App\Models\Company;
use App\Models\CustomerFeedback;
use App\Models\SupportEscalation;
use App\Models\SupportKnowledgeArticle;
use App\Models\SupportMacro;
use App\Models\SupportTicket;
use App\Models\User;

final class AdminSupportInsights
{
    /**
     * @return array<string, mixed>
     */
    public static function dashboard(): array
    {
        $open = SupportTicket::query()->whereIn('status', ['open', 'pending'])->count();
        $overdue = SupportTicket::query()
            ->whereIn('status', ['open', 'pending'])
            ->whereNotNull('sla_due_at')
            ->where('sla_due_at', '<', now())
            ->count();
        $avgResponse = SupportTicket::query()
            ->whereNotNull('first_response_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, first_response_at)) as mins')
            ->value('mins');

        return [
            'open_tickets' => $open,
            'overdue_sla' => $overdue,
            'avg_first_response_minutes' => $avgResponse ? (int) round((float) $avgResponse) : null,
            'open_escalations' => SupportEscalation::query()->where('status', 'open')->count(),
            'new_feedback' => CustomerFeedback::query()->where('status', 'new')->count(),
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function ticketList(int $limit = 80): array
    {
        return SupportTicket::query()
            ->with(['company:id,company_name', 'assignedTo:id,name'])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (SupportTicket $t) => [
                'id' => $t->id,
                'reference' => $t->reference,
                'subject' => $t->subject,
                'status' => $t->status,
                'priority' => $t->priority,
                'category' => $t->category,
                'company' => $t->company?->company_name,
                'assignee' => $t->assignedTo?->name,
                'sla_due_at' => $t->sla_due_at?->toIso8601String(),
                'updated_at' => $t->updated_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function companyTimeline(?int $companyId, int $limit = 50): array
    {
        if (! $companyId) {
            return [];
        }
        $company = Company::find($companyId);
        if (! $company) {
            return [];
        }

        $events = collect(AdminCompanyShow::timeline($company, $limit));

        CommunicationDeliveryLog::query()
            ->where('company_id', $companyId)
            ->whereIn('status', ['failed', 'bounced'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->each(function (CommunicationDeliveryLog $log) use ($events) {
                $events->push([
                    'id' => 'delivery-'.$log->id,
                    'type' => 'delivery',
                    'label' => 'Email '.$log->status,
                    'detail' => $log->template_key,
                    'at' => $log->created_at->toIso8601String(),
                ]);
            });

        return $events->sortByDesc('at')->take($limit)->values()->all();
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public static function adminUsers(): array
    {
        return User::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'staff']))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name])
            ->all();
    }

    public static function seedKnowledgeDefaults(): void
    {
        if (SupportMacro::query()->exists()) {
            return;
        }
        SupportMacro::create([
            'title' => 'Acknowledge ticket',
            'category' => 'general',
            'body' => 'Thank you for contacting Offacto support. We are reviewing your request and will respond shortly.',
            'shortcut' => '/ack',
        ]);
        SupportKnowledgeArticle::create([
            'slug' => 'password-reset-flow',
            'title' => 'Password reset (customer-facing)',
            'category' => 'recovery',
            'body' => 'Direct customers to the login page → Forgot password. Never share or set passwords manually.',
            'published' => true,
        ]);
    }
}
