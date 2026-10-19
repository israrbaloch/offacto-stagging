<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformSettingsService;
use App\Support\AdminFinancialInsights;
use App\Support\FinancialDocumentSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminFinancialDocumentController extends Controller
{
    private const REGISTRY = FinancialDocumentSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        $sections = FinancialDocumentSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Financial/Index', [
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (FinancialDocumentSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.financial.operation', $section);
        }

        $def = FinancialDocumentSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Financial/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => FinancialDocumentSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (FinancialDocumentSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $settings->handleUploads($section, $request, self::REGISTRY);
        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.financial.updated');

        return back()->with('status', 'financial-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.financial.reset');

        return back()->with('status', 'financial-settings-reset');
    }

    public function operation(string $section): InertiaResponse
    {
        if (! FinancialDocumentSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $meta = collect(FinancialDocumentSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'version-history' => ['events' => AdminFinancialInsights::documentRevisions()],
            'reconciliation' => ['summary' => AdminFinancialInsights::reconciliationSummary()],
            'exceptions' => ['items' => AdminFinancialInsights::exceptions()],
            'delivery-history' => ['deliveries' => AdminFinancialInsights::deliveryHistory()],
            'audit-export' => [],
            default => [],
        };

        return Inertia::render('Admin/Financial/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => FinancialDocumentSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function auditExport(Request $request)
    {
        $request->validate(['confirm' => ['required', 'accepted']]);

        $lines = [];
        $lines[] = 'type,at,detail';
        foreach (AdminFinancialInsights::documentRevisions(500) as $row) {
            $lines[] = '"activity","'.($row['at'] ?? '').'","'.str_replace('"', '""', $row['action'].' '.$row['detail']).'"';
        }
        foreach (AdminFinancialInsights::deliveryHistory(200) as $row) {
            $lines[] = '"delivery","'.($row['at'] ?? '').'","'.str_replace('"', '""', ($row['channel'] ?? '').' '.($row['document'] ?? '')).'"';
        }

        $csv = implode("\n", $lines);

        return Response::streamDownload(function () use ($csv) {
            echo $csv;
        }, 'financial-audit-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
