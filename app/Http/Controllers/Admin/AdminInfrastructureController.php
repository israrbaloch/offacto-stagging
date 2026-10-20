<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\InfraBackupRun;
use App\Models\InfraMaintenanceWindow;
use App\Models\InfraRestoreTest;
use App\Services\PlatformSettingsService;
use App\Support\AdminInfrastructureInsights;
use App\Support\InfraReference;
use App\Support\InfrastructurePolicy;
use App\Support\InfrastructureSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminInfrastructureController extends Controller
{
    private const REGISTRY = InfrastructureSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        $sections = InfrastructureSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Infrastructure/Index', [
            'metrics' => AdminInfrastructureInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (InfrastructureSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.infrastructure.operation', $section);
        }

        $def = InfrastructureSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Infrastructure/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => InfrastructureSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (InfrastructureSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.infrastructure.updated');

        return back()->with('status', 'infrastructure-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.infrastructure.reset');

        return back()->with('status', 'infrastructure-settings-reset');
    }

    public function operation(string $section): InertiaResponse
    {
        if (! InfrastructureSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $meta = collect(InfrastructureSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'database-health' => ['database' => AdminInfrastructureInsights::databaseHealth()],
            'queue-workers' => ['queue' => AdminInfrastructureInsights::queueStatus()],
            'scheduled-tasks' => ['tasks' => AdminInfrastructureInsights::scheduledTasks()],
            'backup-management' => ['backups' => InfraBackupRun::query()->orderByDesc('created_at')->limit(50)->get()],
            'restore-dr' => ['restoreTests' => InfraRestoreTest::query()->orderByDesc('created_at')->limit(30)->get()],
            'storage-management' => ['storage' => AdminInfrastructureInsights::storageBreakdown()],
            'failed-jobs' => ['failedJobs' => AdminInfrastructureInsights::failedJobs()],
            'system-logs' => ['logLines' => AdminInfrastructureInsights::logTail(200)],
            'data-integrity' => ['issues' => AdminInfrastructureInsights::integrityIssues()],
            'maintenance-windows' => [
                'windows' => InfraMaintenanceWindow::query()->orderByDesc('starts_at')->limit(30)->get(),
                'maintenanceOn' => \App\Models\SiteSetting::getBoolean('maintenance_enabled', false),
            ],
            'dr-metrics' => [
                'rpo_hours' => InfrastructurePolicy::rpoHours(),
                'rto_hours' => InfrastructurePolicy::rtoHours(),
                'restore_interval_days' => InfrastructurePolicy::restoreTestIntervalDays(),
                'last_passed' => InfraRestoreTest::query()->where('status', 'passed')->latest('tested_at')->first(),
            ],
            default => [],
        };

        return Inertia::render('Admin/Infrastructure/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => InfrastructureSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function storeBackupRun(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'destination' => ['required', 'string', 'max:128'],
            'status' => ['required', Rule::in(['completed', 'failed', 'partial'])],
            'encrypted' => ['boolean'],
            'size_bytes' => ['nullable', 'integer', 'min' => 0],
            'notes' => ['nullable', 'string'],
        ]);

        InfraBackupRun::create([
            'reference' => InfraReference::make('BKP'),
            ...$data,
            'encrypted' => $request->boolean('encrypted', true),
            'started_at' => now()->subHour(),
            'completed_at' => now(),
        ]);

        ActivityLog::record('admin.infrastructure.backup.recorded');

        return back()->with('status', 'infra-backup-recorded');
    }

    public function storeRestoreTest(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['planned', 'passed', 'failed'])],
            'result_notes' => ['nullable', 'string'],
            'confirm' => ['accepted'],
        ]);

        InfraRestoreTest::create([
            'reference' => InfraReference::make('RST'),
            'status' => $data['status'],
            'tested_at' => $data['status'] !== 'planned' ? now() : null,
            'result_notes' => $data['result_notes'] ?? null,
            'authorized_by_user_id' => $request->user()->id,
        ]);

        ActivityLog::record('admin.infrastructure.restore_test.recorded', metadata: ['status' => $data['status']]);

        return back()->with('status', 'infra-restore-test-recorded');
    }

    public function storeMaintenanceWindow(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'pause_queues' => ['boolean'],
            'maintenance_mode' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        InfraMaintenanceWindow::create([
            ...$data,
            'pause_queues' => $request->boolean('pause_queues'),
            'maintenance_mode' => $request->boolean('maintenance_mode'),
            'status' => 'scheduled',
        ]);

        return back()->with('status', 'infra-maintenance-scheduled');
    }

    public function retryFailedJob(Request $request, \App\Services\FailedJobRetryService $retry): RedirectResponse
    {
        $data = $request->validate([
            'uuid' => ['required', 'uuid'],
            'confirm' => ['accepted'],
            'duplicate_ack' => ['accepted'],
        ]);

        \App\Support\AdminAccess::assert($request->user(), \App\Support\AdminAccess::GOVERNANCE);
        $retry->retry($data['uuid'], 'infrastructure');

        return back()->with('status', 'infra-job-retried');
    }
}
