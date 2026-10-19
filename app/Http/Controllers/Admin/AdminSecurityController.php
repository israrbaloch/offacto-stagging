<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\SecurityAccountRestriction;
use App\Models\SecurityEvent;
use App\Models\SecurityFraudReview;
use App\Models\SecurityIncident;
use App\Models\SecurityPolicyException;
use App\Models\SecurityRotationTask;
use App\Models\User;
use App\Services\PlatformSettingsService;
use App\Support\AdminSecurityInsights;
use App\Support\PlatformLocales;
use App\Support\SecurityReference;
use App\Support\SecuritySettingsRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminSecurityController extends Controller
{
    private const REGISTRY = SecuritySettingsRegistry::class;

    public function index(): InertiaResponse
    {
        AdminSecurityInsights::seedRotationTasks();

        $sections = SecuritySettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Security/Index', [
            'metrics' => AdminSecurityInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (SecuritySettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.security.operation', $section);
        }

        $def = SecuritySettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Security/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => SecuritySettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (SecuritySettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.security.updated');

        return back()->with('status', 'security-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.security.reset');

        return back()->with('status', 'security-settings-reset');
    }

    public function operation(string $section, Request $request): InertiaResponse
    {
        if (! SecuritySettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        AdminSecurityInsights::seedRotationTasks();

        $meta = collect(SecuritySettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'suspicious-activity' => ['signals' => AdminSecurityInsights::suspiciousSignals()],
            'account-risk' => [
                'restrictions' => SecurityAccountRestriction::query()->with(['user:id,email', 'company:id,company_name'])->orderByDesc('created_at')->limit(50)->get(),
                'users' => User::query()->orderBy('email')->limit(100)->get(['id', 'email', 'name']),
                'companies' => Company::query()->orderBy('company_name')->limit(100)->get(['id', 'company_name']),
            ],
            'fraud-queue' => [
                'reviews' => SecurityFraudReview::query()->orderByDesc('created_at')->limit(50)->get(),
                'suggestions' => AdminSecurityInsights::fraudSuggestions(),
            ],
            'secret-rotation' => [
                'tasks' => SecurityRotationTask::query()->orderBy('due_at')->get(),
                'api_keys_due' => AdminSecurityInsights::apiKeysDueRotation(),
            ],
            'security-audit-log' => $this->auditLogPayload($request),
            'vulnerability-management' => [
                'vuln' => $request->session()->get('security_vuln_scan', ['ok' => null, 'message' => 'Run scan to refresh advisory data.', 'advisories' => []]),
            ],
            'security-incidents' => [
                'incidents' => SecurityIncident::query()->orderByDesc('created_at')->limit(50)->get(),
            ],
            'policy-exceptions' => [
                'exceptions' => SecurityPolicyException::query()->orderByDesc('created_at')->limit(50)->get(),
            ],
            default => [],
        };

        return Inertia::render('Admin/Security/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => SecuritySettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function storeRestriction(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'restriction_type' => ['required', Rule::in(['review', 'limited', 'suspended'])],
            'reason' => ['required', 'string'],
            'expires_at' => ['nullable', 'date'],
            'confirm' => ['accepted'],
        ]);

        $restriction = SecurityAccountRestriction::create([
            'reference' => SecurityReference::make('RST'),
            'user_id' => $data['user_id'] ?? null,
            'company_id' => $data['company_id'] ?? null,
            'restriction_type' => $data['restriction_type'],
            'reason' => $data['reason'],
            'status' => 'active',
            'expires_at' => $data['expires_at'] ?? null,
            'authorized_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.security.restriction.applied', subject: $restriction);

        return back()->with('status', 'security-restriction-applied');
    }

    public function storeFraudReview(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'review_type' => ['required', 'string', 'max:64'],
            'summary' => ['required', 'string'],
            'subject_type' => ['nullable', 'string'],
            'subject_id' => ['nullable', 'integer'],
        ]);

        SecurityFraudReview::create([
            'reference' => SecurityReference::make('FRD'),
            ...$data,
            'status' => 'open',
            'assigned_to_user_id' => $request->user()->id,
        ]);

        return back()->with('status', 'security-fraud-review-created');
    }

    public function updateFraudReview(Request $request, SecurityFraudReview $review): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['open', 'investigating', 'cleared', 'confirmed'])],
        ]);
        $review->update($data);

        return back();
    }

    public function completeRotation(Request $request, SecurityRotationTask $task): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']]);
        $task->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by_user_id' => $request->user()->id,
        ]);
        ActivityLog::record('admin.security.rotation.completed', subject: $task);

        return back();
    }

    public function runVulnerabilityScan(): RedirectResponse
    {
        $summary = AdminSecurityInsights::vulnerabilitySummary();
        ActivityLog::record('admin.security.vuln_scan', metadata: ['ok' => $summary['ok']]);

        return redirect()->route('admin.security.operation', 'vulnerability-management')
            ->with('security_vuln_scan', $summary);
    }

    public function storeIncident(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'severity' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'summary' => ['required', 'string'],
            'containment_actions' => ['nullable', 'string'],
        ]);

        SecurityIncident::create([
            'reference' => SecurityReference::make('SEC'),
            'severity' => $data['severity'],
            'status' => 'open',
            'summary' => $data['summary'],
            'containment_actions' => $data['containment_actions'] ?? null,
        ]);

        return back()->with('status', 'security-incident-created');
    }

    public function storePolicyException(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'policy_key' => ['required', 'string', 'max:128'],
            'reason' => ['required', 'string'],
            'expires_at' => ['required', 'date', 'after:now'],
            'confirm' => ['accepted'],
        ]);

        SecurityPolicyException::create([
            'reference' => SecurityReference::make('EXC'),
            'policy_key' => $data['policy_key'],
            'reason' => $data['reason'],
            'status' => 'active',
            'authorized_by_user_id' => $request->user()->id,
            'expires_at' => $data['expires_at'],
        ]);

        ActivityLog::record('admin.security.policy_exception.created', metadata: ['policy' => $data['policy_key']]);

        return back()->with('status', 'security-exception-created');
    }

    public function revokePolicyException(SecurityPolicyException $exception): RedirectResponse
    {
        $exception->update(['status' => 'revoked', 'revoked_at' => now()]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function auditLogPayload(Request $request): array
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        $query = SecurityEvent::query()->with(['user:id,name,email']);
        if ($search = trim($filters['q'] ?? '')) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('email', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $events = $query->latest()->paginate(25)->withQueryString()->through(fn (SecurityEvent $event) => [
            'id' => $event->id,
            'event_type' => $event->event_type,
            'outcome' => $event->outcome,
            'email' => $event->email,
            'ip_address' => $event->ip_address,
            'created_at' => $event->created_at?->toIso8601String(),
            'user' => $event->user?->only(['id', 'name', 'email']),
        ]);

        $privileged = ActivityLog::query()
            ->where('action', 'like', 'admin.%')
            ->latest()
            ->limit(15)
            ->get(['id', 'action', 'outcome', 'created_at'])
            ->map(fn (ActivityLog $log) => [
                'id' => 'act-'.$log->id,
                'event_type' => $log->action,
                'outcome' => $log->outcome,
                'email' => null,
                'ip_address' => null,
                'created_at' => $log->created_at->toIso8601String(),
                'user' => null,
            ]);

        return [
            'events' => $events,
            'privilegedSample' => $privileged,
            'filters' => ['q' => $filters['q'] ?? ''],
        ];
    }
}
