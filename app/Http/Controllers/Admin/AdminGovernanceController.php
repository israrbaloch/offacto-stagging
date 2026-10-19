<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\GovAdminAutomationKey;
use App\Models\GovBulkOperation;
use App\Models\GovConfigChangeLog;
use App\Models\GovConfigSnapshot;
use App\Models\GovExportJob;
use App\Models\GovImportJob;
use App\Models\GovRunbook;
use App\Models\GovScheduledConfigChange;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\PlatformSettingsService;
use App\Support\AdminGovernanceInsights;
use App\Support\AdminInfrastructureInsights;
use App\Support\AdminSettingsRoutes;
use App\Support\CommunicationSettingsRegistry;
use App\Support\ComplianceSettingsRegistry;
use App\Support\FinancialDocumentSettingsRegistry;
use App\Support\InfrastructureSettingsRegistry;
use App\Support\IntegrationSettingsRegistry;
use App\Support\ProductSettingsRegistry;
use App\Support\SecuritySettingsRegistry;
use App\Support\SupportSettingsRegistry;
use App\Support\GovernancePolicy;
use App\Support\GovernanceReference;
use App\Support\GovernanceSettingsRegistry;
use App\Support\PlatformLocales;
use App\Support\PlatformSettingsRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminGovernanceController extends Controller
{
    private const REGISTRY = GovernanceSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        AdminGovernanceInsights::seedRunbooks();

        $sections = GovernanceSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Governance/Index', [
            'metrics' => AdminGovernanceInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (GovernanceSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.governance.operation', $section);
        }

        $def = GovernanceSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Governance/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => GovernanceSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (GovernanceSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.governance.updated');

        return back()->with('status', 'governance-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.governance.reset');

        return back()->with('status', 'governance-settings-reset');
    }

    public function operation(string $section, Request $request): InertiaResponse
    {
        if (! GovernanceSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        AdminGovernanceInsights::seedRunbooks();

        $meta = collect(GovernanceSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'bulk-operations' => [
                'operations' => GovBulkOperation::query()->orderByDesc('created_at')->limit(30)->get(),
            ],
            'import-migration' => [
                'imports' => GovImportJob::query()->orderByDesc('created_at')->limit(30)->get(),
            ],
            'export-jobs' => [
                'exports' => GovExportJob::query()->orderByDesc('created_at')->limit(30)->get(),
            ],
            'config-history' => [
                'changes' => GovConfigChangeLog::query()->with('changedBy:id,name')->orderByDesc('created_at')->limit(100)->get(),
            ],
            'config-versioning' => [
                'snapshots' => GovConfigSnapshot::query()->with('createdBy:id,name')->orderByDesc('created_at')->limit(30)->get(),
                'registrySections' => $this->snapshotSectionOptions(),
            ],
            'approval-queue' => [
                'approvals' => AdminGovernanceInsights::approvalQueue(),
            ],
            'scheduled-changes' => [
                'scheduled' => GovScheduledConfigChange::query()->orderBy('effective_at')->limit(30)->get(),
                'registrySections' => $this->snapshotSectionOptions(),
            ],
            'action-simulation' => [
                'registrySections' => $this->snapshotSectionOptions(),
                'simulation' => $request->session()->get('gov_simulation'),
            ],
            'runbooks' => [
                'runbooks' => GovRunbook::query()->orderBy('category')->orderBy('title')->get(),
            ],
            'global-audit' => [
                'auditQuery' => $request->string('q')->toString(),
                'auditResults' => AdminGovernanceInsights::auditSearch($request->string('q')->toString()),
            ],
            'reconciliation' => [
                'issues' => AdminInfrastructureInsights::integrityIssues(),
            ],
            'admin-api' => [
                'keys' => GovAdminAutomationKey::query()->orderByDesc('created_at')->limit(30)->get(),
                'plainKey' => $request->session()->pull('gov_automation_plain_key'),
            ],
            'admin-access-review' => [
                'admins' => AdminGovernanceInsights::adminAccessReview(),
            ],
            default => [],
        };

        return Inertia::render('Admin/Governance/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => GovernanceSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    /**
     * @return list<array{registry: string, section: string, label: string, href: ?string, area: string}>
     */
    private function snapshotSectionOptions(): array
    {
        $registries = [
            PlatformSettingsRegistry::class,
            FinancialDocumentSettingsRegistry::class,
            ComplianceSettingsRegistry::class,
            IntegrationSettingsRegistry::class,
            CommunicationSettingsRegistry::class,
            SupportSettingsRegistry::class,
            SecuritySettingsRegistry::class,
            InfrastructureSettingsRegistry::class,
            ProductSettingsRegistry::class,
            GovernanceSettingsRegistry::class,
        ];

        $options = [];
        foreach ($registries as $registry) {
            $area = AdminSettingsRoutes::registryLabel($registry);
            foreach ($registry::definitions() as $id => $def) {
                $options[] = [
                    'registry' => $registry,
                    'section' => $id,
                    'label' => $def['title'].' — '.$area,
                    'href' => AdminSettingsRoutes::sectionHref($registry, $id),
                    'area' => $area,
                ];
            }
        }

        return $options;
    }

    public function previewBulk(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'operation' => ['required', Rule::in(['deactivate_dormant_companies', 'remind_unverified_users'])],
            'inactive_days' => ['nullable', 'integer', 'min:30'],
        ]);

        $preview = AdminGovernanceInsights::bulkPreview($data['operation'], $data);

        GovBulkOperation::create([
            'reference' => GovernanceReference::make('BLK'),
            'operation' => $data['operation'],
            'parameters' => $data,
            'preview' => $preview,
            'impact_summary' => $preview['summary'],
            'status' => 'draft',
        ]);

        return back()->with('status', 'governance-bulk-previewed');
    }

    public function executeBulk(Request $request, GovBulkOperation $bulk): RedirectResponse
    {
        $rules = ['confirm' => ['accepted']];
        if (GovernancePolicy::bulkRequiresDualConfirm()) {
            $rules['impact_ack'] = ['accepted'];
        }
        $request->validate($rules);

        GovernancePolicy::assertOperationalMutationAllowed();

        if ($bulk->status !== 'draft') {
            return back()->withErrors(['bulk' => 'Operation already processed.']);
        }

        $affected = 0;
        if ($bulk->operation === 'deactivate_dormant_companies') {
            $days = max(30, (int) ($bulk->parameters['inactive_days'] ?? 180));
            $max = GovernancePolicy::exportExpiryDays(); // reuse cap - use bulk max from settings
            $max = max(1, SiteSetting::getInteger('gov_bulk_max_rows', 500));
            $affected = Company::query()
                ->inactive()
                ->where('updated_at', '<', now()->subDays($days))
                ->limit($max)
                ->update(['is_active' => false]);
        }

        $bulk->update([
            'status' => 'executed',
            'executed_by_user_id' => $request->user()->id,
            'executed_at' => now(),
            'impact_summary' => ($bulk->impact_summary ?? '')." Executed: {$affected} records affected.",
        ]);

        ActivityLog::record('admin.governance.bulk.executed', metadata: ['reference' => $bulk->reference, 'affected' => $affected]);

        return back()->with('status', 'governance-bulk-executed');
    }

    public function storeImport(Request $request): RedirectResponse
    {
        GovernancePolicy::assertOperationalMutationAllowed();

        $data = $request->validate([
            'import_type' => ['required', Rule::in(['customers_csv', 'services_csv'])],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'field_mapping' => ['nullable', 'array'],
        ]);

        $path = $request->file('file')->store('governance/imports');
        $handle = fopen(Storage::path($path), 'r');
        $headers = $handle ? fgetcsv($handle) : false;
        $rows = 0;
        $errors = [];
        if ($handle) {
            while (($row = fgetcsv($handle)) !== false) {
                $rows++;
                if ($rows <= 5 && count($row) !== count($headers ?: [])) {
                    $errors[] = ['row' => $rows, 'message' => 'Column count mismatch'];
                }
                if ($rows >= 500) {
                    break;
                }
            }
            fclose($handle);
        }

        GovImportJob::create([
            'reference' => GovernanceReference::make('IMP'),
            'import_type' => $data['import_type'],
            'status' => count($errors) ? 'validation_failed' : 'validated',
            'field_mapping' => $data['field_mapping'] ?? [],
            'stats' => ['rows_scanned' => $rows, 'file' => $path],
            'error_report' => $errors,
            'requested_by_user_id' => $request->user()->id,
        ]);

        return back()->with('status', 'governance-import-validated');
    }

    public function storeExport(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'export_type' => ['required', Rule::in(['activity_log', 'companies', 'audit_bundle'])],
        ]);

        $count = match ($data['export_type']) {
            'companies' => Company::query()->count(),
            'activity_log' => ActivityLog::query()->count(),
            default => 0,
        };

        GovExportJob::create([
            'reference' => GovernanceReference::make('EXP'),
            'export_type' => $data['export_type'],
            'status' => 'ready',
            'row_count' => $count,
            'expires_at' => now()->addDays(GovernancePolicy::exportExpiryDays()),
            'requested_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.governance.export.requested', metadata: $data);

        return back()->with('status', 'governance-export-queued');
    }

    public function markExportDownloaded(Request $request, GovExportJob $export): RedirectResponse
    {
        $export->update(['downloaded_at' => now()]);
        if (SiteSetting::getBoolean('gov_export_log_downloads', true)) {
            ActivityLog::record('admin.governance.export.downloaded', metadata: ['reference' => $export->reference]);
        }

        return back()->with('status', 'governance-export-download-logged');
    }

    public function storeSnapshot(Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'registry' => ['required', 'string'],
            'section_id' => ['required', 'string'],
        ]);

        if (! class_exists($data['registry']) || ! method_exists($data['registry'], 'definition')) {
            abort(422);
        }

        GovConfigSnapshot::create([
            'label' => $data['label'],
            'registry' => $data['registry'],
            'section_id' => $data['section_id'],
            'payload' => $settings->valuesForSection($data['section_id'], $data['registry']),
            'created_by_user_id' => $request->user()->id,
        ]);

        return back()->with('status', 'governance-snapshot-created');
    }

    public function restoreSnapshot(Request $request, GovConfigSnapshot $snapshot, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate([
            'confirm' => ['accepted'],
            'scope_ack' => ['accepted'],
        ]);

        GovernancePolicy::assertOperationalMutationAllowed();

        $payload = $snapshot->payload ?? [];
        $filtered = [];
        foreach ($payload as $key => $value) {
            if (str_ends_with((string) $key, '_preview_url') || str_ends_with((string) $key, '_set')) {
                continue;
            }
            $filtered[$key] = $value;
        }

        $settings->persistSection(
            $snapshot->section_id,
            $filtered,
            $snapshot->registry,
            'admin.governance.snapshot.restored',
        );

        ActivityLog::record('admin.governance.snapshot.restored', metadata: ['snapshot_id' => $snapshot->id]);

        return back()->with('status', 'governance-snapshot-restored');
    }

    public function storeScheduledChange(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'registry' => ['required', 'string'],
            'section_id' => ['required', 'string'],
            'payload' => ['nullable', 'array'],
            'effective_at' => ['required', 'date', 'after:now'],
            'reason' => ['nullable', 'string'],
            'approved' => ['accepted'],
        ]);

        GovScheduledConfigChange::create([
            'reference' => GovernanceReference::make('SCH'),
            'title' => $data['title'],
            'registry' => $data['registry'],
            'section_id' => $data['section_id'],
            'payload' => $data['payload'] ?? [],
            'effective_at' => $data['effective_at'],
            'reason' => $data['reason'] ?? null,
            'status' => 'scheduled',
            'created_by_user_id' => $request->user()->id,
            'approved_by_user_id' => $request->user()->id,
        ]);

        return back()->with('status', 'governance-change-scheduled');
    }

    public function simulateChange(Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $data = $request->validate([
            'registry' => ['required', 'string'],
            'section_id' => ['required', 'string'],
            'payload' => ['nullable', 'array'],
        ]);

        $current = $settings->valuesForSection($data['section_id'], $data['registry']);
        $diff = [];
        foreach ($data['payload'] as $key => $newVal) {
            $old = $current[$key] ?? null;
            if ($old != $newVal) {
                $diff[] = ['key' => $key, 'from' => $old, 'to' => $newVal];
            }
        }

        return back()->with('gov_simulation', [
            'section' => $data['section_id'],
            'changes' => $diff,
            'impact' => count($diff).' setting(s) would change.',
        ]);
    }

    public function storeRunbook(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:128', 'alpha_dash', Rule::unique('gov_runbooks', 'slug')],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(['outage', 'integration', 'payment', 'security', 'restore'])],
            'body' => ['required', 'string'],
        ]);

        GovRunbook::create([...$data, 'version' => '1.0', 'published' => true]);

        return back()->with('status', 'governance-runbook-created');
    }

    public function issueAutomationKey(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scopes' => ['nullable', 'array'],
            'confirm' => ['accepted'],
        ]);

        $issued = GovAdminAutomationKey::issue($data['name'], $data['scopes'] ?? ['reports:read'], $request->user()->id);
        ActivityLog::record('admin.governance.automation_key.issued', metadata: ['prefix' => $issued['model']->key_prefix]);

        return back()->with('gov_automation_plain_key', $issued['plain']);
    }

    public function revokeAutomationKey(GovAdminAutomationKey $key): RedirectResponse
    {
        $key->update(['revoked_at' => now()]);

        return back()->with('status', 'governance-key-revoked');
    }
}
