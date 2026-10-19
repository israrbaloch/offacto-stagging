<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\CompanyDataExport;
use App\Models\CompanyDeletionRequest;
use App\Models\CompanyFeatureOverride;
use App\Models\CompanyStatusEvent;
use App\Models\CompanyVerification;
use App\Models\Language;
use App\Models\Status;
use App\Models\SubscriptionPlan;
use App\Services\CompanyAdminWorkflow;
use App\Services\CompanyDataExportService;
use App\Support\AdminCompanyShow;
use App\Support\PlanEntitlementCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'approval' => ['nullable', 'string', 'max:64'],
            'active' => ['nullable', Rule::in(['yes', 'no', 'all'])],
            'subscription' => ['nullable', Rule::in(['all', 'trial', 'subscribed', 'expired', 'none'])],
            'language' => ['nullable', 'integer', 'exists:languages,id'],
            'country' => ['nullable', 'string', 'size:2'],
            'registered_from' => ['nullable', 'date'],
            'registered_to' => ['nullable', 'date'],
        ]);

        $query = Company::query()
            ->with([
                'user:id,name,email',
                'statusRelation:id,name',
                'languageRelation:id,code,name',
                'companySetting:company_id,postbode_default_country',
            ]);

        if ($search = trim($filters['q'] ?? '')) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('vat_number', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($q) => $q
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['approval'])) {
            $query->whereHas('statusRelation', fn ($q) => $q
                ->where('for', 'companies')
                ->where('name', $filters['approval']));
        }

        $active = $filters['active'] ?? 'all';
        if ($active === 'yes') {
            $query->where('is_active', true);
        } elseif ($active === 'no') {
            $query->where('is_active', false);
        }

        if (! empty($filters['language'])) {
            $query->where('language', $filters['language']);
        }

        if (! empty($filters['country'])) {
            $country = strtoupper($filters['country']);
            $query->whereHas('companySetting', fn ($q) => $q->where('postbode_default_country', $country));
        }

        $subscription = $filters['subscription'] ?? 'all';
        if ($subscription === 'subscribed') {
            $query->whereNotNull('subscription_plan')
                ->where(function ($q) {
                    $q->whereNull('subscription_ends_at')->orWhere('subscription_ends_at', '>', now());
                });
        } elseif ($subscription === 'trial') {
            $query->whereNull('subscription_plan')
                ->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>', now());
        } elseif ($subscription === 'expired') {
            $query->where(function ($q) {
                $q->where(function ($inner) {
                    $inner->whereNotNull('subscription_ends_at')->where('subscription_ends_at', '<=', now());
                })->orWhere(function ($inner) {
                    $inner->whereNull('subscription_plan')
                        ->whereNotNull('trial_ends_at')
                        ->where('trial_ends_at', '<=', now());
                });
            });
        } elseif ($subscription === 'none') {
            $query->whereNull('subscription_plan')->whereNull('trial_ends_at');
        }

        if (! empty($filters['registered_from'])) {
            $query->whereDate('created_at', '>=', $filters['registered_from']);
        }
        if (! empty($filters['registered_to'])) {
            $query->whereDate('created_at', '<=', $filters['registered_to']);
        }

        $companies = $query
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Company $company) => [
                'id' => $company->id,
                'company_name' => $company->company_name,
                'email' => $company->email,
                'owner' => $company->user?->name,
                'approval_status' => $company->statusRelation?->name,
                'is_active' => (bool) $company->is_active,
                'subscription_plan' => $company->subscription_plan,
                'language' => $company->languageRelation?->code,
                'country' => $company->companySetting?->postbode_default_country ?? 'NL',
                'created_at' => $company->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
            'filters' => array_merge([
                'q' => '',
                'approval' => '',
                'active' => 'all',
                'subscription' => 'all',
                'language' => '',
                'country' => '',
                'registered_from' => '',
                'registered_to' => '',
            ], $filters),
            'approvalStatuses' => Status::query()->where('for', 'companies')->orderBy('name')->pluck('name'),
            'languages' => Language::orderBy('name')->get(['id', 'name', 'code']),
            'plans' => SubscriptionPlan::query()->orderBy('sort_order')->pluck('slug'),
        ]);
    }

    public function approvals(): Response
    {
        $pending = Company::query()
            ->pending()
            ->with(['user:id,name,email', 'languageRelation:id,name', 'companySetting:company_id,postbode_default_country'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Company $company) => AdminCompanyShow::profile($company));

        return Inertia::render('Admin/Companies/Approvals', [
            'companies' => $pending,
            'pendingMeta' => [
                'total' => Company::query()->pending()->count(),
            ],
        ]);
    }

    public function show(Company $company): Response
    {
        $company->load('companySetting');

        $verification = CompanyVerification::firstOrCreate(
            ['company_id' => $company->id],
            ['status' => 'not_required'],
        );

        return Inertia::render('Admin/Companies/Show', [
            'profile' => AdminCompanyShow::profile($company),
            'usage' => AdminCompanyShow::usage($company),
            'integrations' => AdminCompanyShow::integrations($company),
            'timeline' => AdminCompanyShow::timeline($company),
            'statusHistory' => CompanyStatusEvent::query()
                ->where('company_id', $company->id)
                ->with('actor:id,name')
                ->latest()
                ->limit(25)
                ->get()
                ->map(fn (CompanyStatusEvent $event) => [
                    'id' => $event->id,
                    'action' => $event->action,
                    'reason' => $event->reason,
                    'actor' => $event->actor?->name,
                    'created_at' => $event->created_at?->toIso8601String(),
                ]),
            'verification' => [
                'status' => $verification->status,
                'notes' => $verification->notes,
                'requirements' => $verification->requirements ?? [],
                'reviewed_at' => $verification->reviewed_at?->toIso8601String(),
            ],
            'overrides' => CompanyFeatureOverride::query()
                ->where('company_id', $company->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (CompanyFeatureOverride $row) => [
                    'id' => $row->id,
                    'capability_key' => $row->capability_key,
                    'granted' => (bool) $row->granted,
                    'reason' => $row->reason,
                    'expires_at' => $row->expires_at?->toIso8601String(),
                    'active' => ! $row->expires_at || $row->expires_at->isFuture(),
                ]),
            'exports' => CompanyDataExport::query()
                ->where('company_id', $company->id)
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (CompanyDataExport $row) => [
                    'id' => $row->id,
                    'format' => $row->format,
                    'status' => $row->status,
                    'created_at' => $row->created_at?->toIso8601String(),
                    'completed_at' => $row->completed_at?->toIso8601String(),
                ]),
            'deletionRequests' => CompanyDeletionRequest::query()
                ->where('company_id', $company->id)
                ->latest()
                ->get()
                ->map(fn (CompanyDeletionRequest $row) => [
                    'id' => $row->id,
                    'status' => $row->status,
                    'reason' => $row->reason,
                    'retention_until' => $row->retention_until?->toDateString(),
                    'legal_hold' => (bool) $row->legal_hold,
                    'anonymized_at' => $row->anonymized_at?->toIso8601String(),
                    'permanently_deleted_at' => $row->permanently_deleted_at?->toIso8601String(),
                ]),
            'planEntitlementCatalog' => PlanEntitlementCatalog::toAdminArray(),
            'statusActions' => ['activate', 'suspend', 'restrict', 'deactivate'],
        ]);
    }

    public function edit(Company $company): Response
    {
        return Inertia::render('Admin/Companies/Edit', [
            'profile' => AdminCompanyShow::profile($company),
            'languages' => Language::orderBy('name')->get(['id', 'name', 'code']),
            'activityOptions' => [
                ['value' => 'main_profession', 'label' => 'Main profession'],
                ['value' => 'secondary_profession', 'label' => 'Secondary profession'],
            ],
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('companies', 'email')->ignore($company->id)],
            'phone' => ['required', 'string', 'max:32', Rule::unique('companies', 'phone')->ignore($company->id)],
            'vat_number' => ['required', 'string', 'max:64'],
            'street' => ['required', 'string', 'max:255'],
            'house' => ['required', 'string', 'max:32'],
            'postal_code' => ['required', 'string', 'max:32'],
            'city' => ['required', 'string', 'max:128'],
            'language' => ['required', 'integer', 'exists:languages,id'],
            'self_employed_activity' => ['nullable', Rule::in(['main_profession', 'secondary_profession'])],
        ]);

        $company->update($data);

        ActivityLog::record('admin.company.profile_updated', subject: $company, companyId: $company->id);

        return redirect()->route('admin.companies.show', $company)->with('status', 'company-saved');
    }

    public function approve(Request $request, Company $company, CompanyAdminWorkflow $workflow): RedirectResponse
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:2000']]);
        $workflow->approve($company, Auth::user(), $data['reason'] ?? null);

        return back()->with('status', 'company-approved');
    }

    public function reject(Request $request, Company $company, CompanyAdminWorkflow $workflow): RedirectResponse
    {
        $data = $request->validate(['reason' => ['nullable', 'string', 'max:2000']]);
        $workflow->reject($company, Auth::user(), $data['reason'] ?? null);

        return back()->with('status', 'company-rejected');
    }

    public function requestInfo(Request $request, Company $company, CompanyAdminWorkflow $workflow): RedirectResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:2000']]);
        $workflow->requestInfo($company, Auth::user(), $data['message']);

        return back()->with('status', 'company-info-requested');
    }

    public function applyStatus(Request $request, Company $company, CompanyAdminWorkflow $workflow): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['activate', 'suspend', 'restrict', 'deactivate'])],
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $workflow->applyStatus($company, Auth::user(), $data['action'], $data['reason'] ?? null);

        return back()->with('status', 'company-status-updated');
    }

    public function enterWorkspace(Company $company): RedirectResponse
    {
        $company->ensureDefaults();
        Auth::user()?->setActiveCompanyId($company->id);
        session(['admin_workspace_company_id' => $company->id]);

        ActivityLog::record('admin.company.workspace_entered', subject: $company, companyId: $company->id);

        return redirect()->route('dashboard')->with('status', 'admin-workspace-entered');
    }

    public function exitWorkspace(Request $request): RedirectResponse
    {
        $companyId = session('admin_workspace_company_id');
        $request->session()->forget(['admin_workspace_company_id', 'active_company_id']);

        if ($companyId) {
            return redirect()->route('admin.companies.show', $companyId)->with('status', 'admin-workspace-exited');
        }

        return redirect()->route('admin.companies.index');
    }

    public function storeExport(Company $company, CompanyDataExportService $exports): RedirectResponse
    {
        $exports->generate($company, Auth::user());
        ActivityLog::record('admin.company.export_requested', subject: $company, companyId: $company->id);

        return back()->with('status', 'company-export-ready');
    }

    public function downloadExport(Company $company, CompanyDataExport $export): StreamedResponse
    {
        abort_if($export->company_id !== $company->id || $export->status !== 'ready' || ! $export->file_path, 404);

        return Storage::disk('local')->download($export->file_path, 'company-'.$company->id.'-export.json');
    }

    public function storeOverride(Request $request, Company $company): RedirectResponse
    {
        $data = $request->validate([
            'capability_key' => ['required', 'string', 'max:120'],
            'granted' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        CompanyFeatureOverride::create([
            'company_id' => $company->id,
            'capability_key' => $data['capability_key'],
            'granted' => $data['granted'],
            'reason' => $data['reason'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'created_by' => Auth::id(),
        ]);

        ActivityLog::record('admin.company.override_created', subject: $company, companyId: $company->id, metadata: $data);

        return back()->with('status', 'company-override-saved');
    }

    public function destroyOverride(Company $company, CompanyFeatureOverride $override): RedirectResponse
    {
        abort_if($override->company_id !== $company->id, 404);
        $override->delete();

        ActivityLog::record('admin.company.override_removed', subject: $company, companyId: $company->id);

        return back()->with('status', 'company-override-removed');
    }

    public function updateVerification(Request $request, Company $company): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['not_required', 'pending', 'verified', 'rejected'])],
            'notes' => ['nullable', 'string', 'max:5000'],
            'requirements' => ['nullable', 'array'],
        ]);

        $verification = CompanyVerification::firstOrCreate(['company_id' => $company->id]);
        $verification->update([
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'requirements' => $data['requirements'] ?? [],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        ActivityLog::record('admin.company.verification_updated', subject: $company, companyId: $company->id, metadata: [
            'status' => $data['status'],
        ]);

        return back()->with('status', 'company-verification-updated');
    }

    public function storeDeletionRequest(Request $request, Company $company): RedirectResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
            'retention_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'legal_hold' => ['sometimes', 'boolean'],
        ]);

        $days = $data['retention_days'] ?? 30;

        CompanyDeletionRequest::create([
            'company_id' => $company->id,
            'requested_by' => Auth::id(),
            'status' => 'pending',
            'reason' => $data['reason'],
            'retention_until' => now()->addDays($days)->toDateString(),
            'legal_hold' => (bool) ($data['legal_hold'] ?? false),
        ]);

        ActivityLog::record('admin.company.deletion_requested', subject: $company, companyId: $company->id);

        return back()->with('status', 'company-deletion-requested');
    }

    public function updateDeletionRequest(Request $request, Company $company, CompanyDeletionRequest $deletionRequest): RedirectResponse
    {
        abort_if($deletionRequest->company_id !== $company->id, 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'legal_hold', 'scheduled', 'completed', 'cancelled'])],
            'legal_hold' => ['sometimes', 'boolean'],
        ]);

        $deletionRequest->update([
            'status' => $data['status'],
            'legal_hold' => (bool) ($data['legal_hold'] ?? $deletionRequest->legal_hold),
        ]);

        if ($data['status'] === 'completed' && ! $deletionRequest->legal_hold) {
            $deletionRequest->update(['anonymized_at' => now()]);
            $company->update([
                'is_active' => false,
                'company_name' => 'Archived company #'.$company->id,
                'email' => 'archived+'.$company->id.'@removed.local',
            ]);
        }

        ActivityLog::record('admin.company.deletion_updated', subject: $company, companyId: $company->id, metadata: $data);

        return back()->with('status', 'company-deletion-updated');
    }
}
