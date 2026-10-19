<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ComplianceAuthorityRequest;
use App\Models\ComplianceBreachIncident;
use App\Models\ComplianceCase;
use App\Models\ComplianceDataSubjectRequest;
use App\Models\ComplianceDeletionJob;
use App\Models\ComplianceDisclosure;
use App\Models\ComplianceEvidenceItem;
use App\Models\ComplianceLegalHold;
use App\Models\PlatformLegalNotice;
use App\Services\PlatformSettingsService;
use App\Support\AdminComplianceInsights;
use App\Support\ComplianceReference;
use App\Support\ComplianceSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminComplianceController extends Controller
{
    private const REGISTRY = ComplianceSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        $sections = ComplianceSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Compliance/Index', [
            'metrics' => AdminComplianceInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (ComplianceSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.compliance.operation', $section);
        }

        $def = ComplianceSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Compliance/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => ComplianceSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (ComplianceSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $settings->handleUploads($section, $request, self::REGISTRY);
        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.compliance.updated');

        return back()->with('status', 'compliance-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.compliance.reset');

        return back()->with('status', 'compliance-settings-reset');
    }

    public function operation(string $section): InertiaResponse
    {
        if (! ComplianceSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $meta = collect(ComplianceSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'legal-notices' => ['notices' => AdminComplianceInsights::legalNotices()],
            'consent-records' => ['consents' => AdminComplianceInsights::consentRecords()],
            'data-subject-requests' => ['requests' => AdminComplianceInsights::dataSubjectRequests()],
            'legal-holds' => ['holds' => ComplianceLegalHold::query()->orderByDesc('placed_at')->limit(50)->get()],
            'deletion-jobs' => ['jobs' => ComplianceDeletionJob::query()->orderByDesc('created_at')->limit(50)->get()],
            'privacy-access' => ['privacy' => AdminComplianceInsights::privacyAccessSignals()],
            'breach-management' => ['breaches' => ComplianceBreachIncident::query()->orderByDesc('discovered_at')->limit(50)->get()],
            'authority-requests' => ['authorityRequests' => AdminComplianceInsights::authorityRequests()],
            'legal-request-review' => [
                'authorityRequests' => AdminComplianceInsights::authorityRequests('review'),
                'reviewMode' => true,
            ],
            'evidence-preservation' => [
                'evidence' => ComplianceEvidenceItem::query()->orderByDesc('captured_at')->limit(50)->get(),
                'authorityRequests' => AdminComplianceInsights::authorityRequests(null, 100),
            ],
            'controlled-disclosure' => [
                'disclosures' => ComplianceDisclosure::query()->with('authorityRequest:id,reference')->orderByDesc('disclosed_at')->limit(50)->get(),
                'authorityRequests' => AdminComplianceInsights::authorityRequests(null, 100),
            ],
            'compliance-cases' => ['cases' => ComplianceCase::query()->orderByDesc('created_at')->limit(50)->get()],
            'peppol-monitoring' => ['peppol' => AdminComplianceInsights::peppolMonitoring()],
            'compliance-reports' => [],
            default => [],
        };

        return Inertia::render('Admin/Compliance/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => ComplianceSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function storeLegalNotice(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['terms', 'privacy', 'dpa', 'cookies', 'other'])],
            'locale' => ['required', 'string', 'max:8'],
            'version_label' => ['required', 'string', 'max:64'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'publish' => ['boolean'],
        ]);

        if ($request->boolean('publish')) {
            PlatformLegalNotice::query()
                ->where('type', $data['type'])
                ->where('locale', $data['locale'])
                ->whereNull('superseded_at')
                ->update(['superseded_at' => now()]);
        }

        $notice = PlatformLegalNotice::create([
            'type' => $data['type'],
            'locale' => $data['locale'],
            'version_label' => $data['version_label'],
            'title' => $data['title'],
            'body' => $data['body'],
            'published_at' => $request->boolean('publish') ? now() : null,
            'created_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.compliance.legal_notice.created', subject: $notice, metadata: [
            'type' => $notice->type,
            'version' => $notice->version_label,
        ]);

        return back()->with('status', 'compliance-notice-saved');
    }

    public function storeDataSubjectRequest(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'request_type' => ['required', Rule::in(['access', 'correction', 'export', 'restriction', 'deletion'])],
            'subject_email' => ['required', 'email'],
            'notes' => ['nullable', 'string'],
        ]);

        $dsar = ComplianceDataSubjectRequest::create([
            'reference' => ComplianceReference::make('DSAR'),
            'request_type' => $data['request_type'],
            'status' => 'received',
            'subject_email' => $data['subject_email'],
            'due_at' => now()->addDays(30),
            'notes' => $data['notes'] ?? null,
            'assigned_to_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.compliance.dsar.created', subject: $dsar, metadata: ['reference' => $dsar->reference]);

        return back()->with('status', 'compliance-dsar-created');
    }

    public function updateDataSubjectRequest(Request $request, ComplianceDataSubjectRequest $dsar): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['received', 'verification', 'in_progress', 'completed', 'rejected'])],
            'identity_verified' => ['boolean'],
        ]);

        if ($request->boolean('identity_verified') && ! $dsar->identity_verified_at) {
            $dsar->identity_verified_at = now();
        }
        $dsar->status = $data['status'];
        if (in_array($data['status'], ['completed', 'rejected'], true)) {
            $dsar->closed_at = now();
        }
        $dsar->save();

        ActivityLog::record('admin.compliance.dsar.updated', subject: $dsar, metadata: ['status' => $dsar->status]);

        return back()->with('status', 'compliance-dsar-updated');
    }

    public function storeAuthorityRequest(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'requesting_authority' => ['required', 'string', 'max:255'],
            'jurisdiction' => ['required', 'string', 'max:8'],
            'legal_basis' => ['required', 'string'],
            'scope_summary' => ['required', 'string'],
            'is_emergency' => ['boolean'],
        ]);

        $isEmergency = $request->boolean('is_emergency');
        if ($isEmergency) {
            $request->validate(['emergency_acknowledged' => ['accepted']]);
        }

        $case = ComplianceCase::create([
            'reference' => ComplianceReference::make('CASE'),
            'case_type' => $isEmergency ? 'emergency_authority' : 'authority_request',
            'title' => 'Authority request: '.$data['requesting_authority'],
            'status' => 'open',
            'restricted' => true,
            'assigned_to_user_id' => $request->user()->id,
        ]);

        $authReq = ComplianceAuthorityRequest::create([
            'reference' => ComplianceReference::make('AUTH'),
            'requesting_authority' => $data['requesting_authority'],
            'jurisdiction' => $data['jurisdiction'],
            'legal_basis' => $data['legal_basis'],
            'scope_summary' => $data['scope_summary'],
            'status' => ComplianceAuthorityRequest::STATUS_RECEIVED,
            'is_emergency' => $isEmergency,
            'assigned_reviewer_id' => $request->user()->id,
            'compliance_case_id' => $case->id,
            'received_at' => now(),
        ]);

        ActivityLog::record('admin.compliance.authority_request.received', subject: $authReq, metadata: [
            'reference' => $authReq->reference,
            'emergency' => $authReq->is_emergency,
        ]);

        return back()->with('status', 'compliance-authority-created');
    }

    public function advanceAuthorityRequest(Request $request, ComplianceAuthorityRequest $authorityRequest): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['start_verification', 'complete_verification', 'legal_review', 'approve_disclosure', 'reject', 'close'])],
            'notes' => ['nullable', 'string'],
        ]);

        $next = match ($data['action']) {
            'start_verification' => ComplianceAuthorityRequest::STATUS_VERIFICATION,
            'complete_verification' => ComplianceAuthorityRequest::STATUS_LEGAL_REVIEW,
            'legal_review' => ComplianceAuthorityRequest::STATUS_LEGAL_REVIEW,
            'approve_disclosure' => ComplianceAuthorityRequest::STATUS_AWAITING_DISCLOSURE,
            'reject' => ComplianceAuthorityRequest::STATUS_REJECTED,
            'close' => ComplianceAuthorityRequest::STATUS_CLOSED,
            default => $authorityRequest->status,
        };

        if ($data['action'] === 'complete_verification') {
            $authorityRequest->verified_at = now();
        }

        $authorityRequest->status = $next;
        $authorityRequest->metadata = array_merge($authorityRequest->metadata ?? [], [
            'last_action' => $data['action'],
            'notes' => $data['notes'] ?? null,
        ]);
        $authorityRequest->save();

        ActivityLog::record('admin.compliance.authority_request.advanced', subject: $authorityRequest, metadata: [
            'action' => $data['action'],
            'status' => $next,
        ]);

        return back()->with('status', 'compliance-authority-updated');
    }

    public function storeDisclosure(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'authority_request_id' => ['required', 'exists:compliance_authority_requests,id'],
            'disclosed_to' => ['required', 'string', 'max:255'],
            'scope_record' => ['required', 'string'],
            'customer_notification' => ['required', Rule::in(['permitted', 'required', 'delayed', 'restricted', 'not_applicable'])],
            'legal_confirm' => ['accepted'],
            'scope_confirm' => ['accepted'],
        ]);

        $auth = ComplianceAuthorityRequest::findOrFail($data['authority_request_id']);
        if ($auth->status !== ComplianceAuthorityRequest::STATUS_AWAITING_DISCLOSURE) {
            return back()->with('error', 'Disclosure requires legal review and approval status first.');
        }

        $disclosure = ComplianceDisclosure::create([
            'authority_request_id' => $auth->id,
            'compliance_case_id' => $auth->compliance_case_id,
            'disclosed_to' => $data['disclosed_to'],
            'scope_record' => $data['scope_record'],
            'approved_by_user_id' => $request->user()->id,
            'disclosed_at' => now(),
            'customer_notification' => $data['customer_notification'],
        ]);

        $auth->update(['status' => ComplianceAuthorityRequest::STATUS_CLOSED]);

        ActivityLog::record('admin.compliance.disclosure.recorded', subject: $disclosure, metadata: [
            'authority_reference' => $auth->reference,
        ]);

        return back()->with('status', 'compliance-disclosure-recorded');
    }

    public function storeEvidence(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'authority_request_id' => ['nullable', 'exists:compliance_authority_requests,id'],
            'record_type' => ['required', 'string', 'max:64'],
            'record_reference' => ['required', 'string', 'max:255'],
            'content_hash' => ['nullable', 'string', 'max:128'],
        ]);

        $item = ComplianceEvidenceItem::create([
            ...$data,
            'captured_at' => now(),
            'metadata' => ['captured_by' => $request->user()->id],
        ]);

        ActivityLog::record('admin.compliance.evidence.captured', subject: $item);

        return back()->with('status', 'compliance-evidence-saved');
    }

    public function storeLegalHold(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'scope_description' => ['required', 'string'],
        ]);

        $hold = ComplianceLegalHold::create([
            'reference' => ComplianceReference::make('HOLD'),
            'title' => $data['title'],
            'scope_description' => $data['scope_description'],
            'status' => 'active',
            'authorized_by_user_id' => $request->user()->id,
            'placed_at' => now(),
        ]);

        ActivityLog::record('admin.compliance.legal_hold.placed', subject: $hold);

        return back()->with('status', 'compliance-hold-placed');
    }

    public function releaseLegalHold(Request $request, ComplianceLegalHold $hold): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']]);
        $hold->update(['status' => 'released', 'released_at' => now()]);
        ActivityLog::record('admin.compliance.legal_hold.released', subject: $hold);

        return back()->with('status', 'compliance-hold-released');
    }

    public function storeDeletionJob(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'category' => ['required', 'string', 'max:64'],
            'summary' => ['required', 'string', 'max:255'],
            'scheduled_for' => ['nullable', 'date'],
        ]);

        $job = ComplianceDeletionJob::create([
            'reference' => ComplianceReference::make('DEL'),
            'category' => $data['category'],
            'status' => 'pending',
            'summary' => $data['summary'],
            'scheduled_for' => $data['scheduled_for'] ?? null,
        ]);

        ActivityLog::record('admin.compliance.deletion_job.created', subject: $job);

        return back()->with('status', 'compliance-deletion-created');
    }

    public function approveDeletionJob(Request $request, ComplianceDeletionJob $job): RedirectResponse
    {
        $request->validate(['confirm' => ['accepted']]);
        $job->update([
            'status' => 'approved',
            'approved_by_user_id' => $request->user()->id,
        ]);
        ActivityLog::record('admin.compliance.deletion_job.approved', subject: $job);

        return back()->with('status', 'compliance-deletion-approved');
    }

    public function storeBreach(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'severity' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'summary' => ['required', 'string'],
            'discovered_at' => ['required', 'date'],
        ]);

        $breach = ComplianceBreachIncident::create([
            'reference' => ComplianceReference::make('BREACH'),
            'severity' => $data['severity'],
            'status' => 'open',
            'discovered_at' => $data['discovered_at'],
            'summary' => $data['summary'],
            'notification_deadline_at' => now()->addHours(72),
        ]);

        ActivityLog::record('admin.compliance.breach.recorded', subject: $breach);

        return back()->with('status', 'compliance-breach-recorded');
    }

    public function complianceReportExport(Request $request)
    {
        $request->validate(['confirm' => ['required', 'accepted']]);

        ActivityLog::record('admin.compliance.report.exported');

        $lines = ['section,metric,value'];
        foreach (AdminComplianceInsights::dashboard() as $key => $value) {
            $lines[] = '"dashboard","'.str_replace('"', '""', $key).'","'.$value.'"';
        }
        foreach (AdminComplianceInsights::dataSubjectRequests(200) as $row) {
            $lines[] = '"dsar","'.($row['reference'] ?? '').'","'.($row['status'] ?? '').'"';
        }
        foreach (AdminComplianceInsights::authorityRequests(null, 200) as $row) {
            $lines[] = '"authority","'.($row['reference'] ?? '').'","'.($row['status'] ?? '').'"';
        }

        $csv = implode("\n", $lines);

        return Response::streamDownload(function () use ($csv) {
            echo $csv;
        }, 'compliance-report-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
