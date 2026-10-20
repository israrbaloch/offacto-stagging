<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\IntegrationApiKey;
use App\Models\IntegrationFailure;
use App\Models\IntegrationProvider;
use App\Models\IntegrationWebhook;
use App\Services\PlatformSettingsService;
use App\Support\AdminIntegrationInsights;
use App\Support\IntegrationSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminIntegrationController extends Controller
{
    private const REGISTRY = IntegrationSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        AdminIntegrationInsights::ensureDefaultProviders();

        $sections = IntegrationSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Integrations/Index', [
            'metrics' => AdminIntegrationInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (IntegrationSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.integrations.operation', $section);
        }

        $def = IntegrationSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Integrations/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => IntegrationSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (IntegrationSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $settings->handleUploads($section, $request, self::REGISTRY);
        $data = $settings->validateSection($section, $request, self::REGISTRY);
        $settings->persistSection($section, $data, self::REGISTRY, 'admin.integrations.updated');

        return back()->with('status', 'integration-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.integrations.reset');

        return back()->with('status', 'integration-settings-reset');
    }

    public function operation(string $section, Request $request): InertiaResponse
    {
        if (! IntegrationSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        AdminIntegrationInsights::ensureDefaultProviders();

        $meta = collect(IntegrationSettingsRegistry::operationSections())->firstWhere('id', $section);

        $payload = match ($section) {
            'webhooks' => [
                'webhooks' => IntegrationWebhook::query()
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn (IntegrationWebhook $webhook) => $webhook->toAdminArray())
                    ->values(),
            ],
            'api-keys' => [
                'apiKeys' => IntegrationApiKey::query()->orderByDesc('created_at')->limit(50)->get(['id', 'name', 'key_prefix', 'scopes', 'last_used_at', 'revoked_at', 'created_at']),
                'newKeyPlain' => $request->session()->pull('integration_api_key_plain'),
            ],
            'health-checks' => [
                'healthResults' => $request->session()->get('integration_health_results', AdminIntegrationInsights::healthChecks()),
            ],
            'failure-queue' => ['failures' => AdminIntegrationInsights::failureQueue()],
            'provider-registry' => ['providers' => IntegrationProvider::query()->orderBy('name')->get()],
            default => [],
        };

        return Inertia::render('Admin/Integrations/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => IntegrationSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function runHealthChecks(): RedirectResponse
    {
        $results = AdminIntegrationInsights::healthChecks();
        ActivityLog::record('admin.integrations.health_check', metadata: ['results' => $results]);

        return redirect()->route('admin.integrations.operation', 'health-checks')
            ->with('integration_health_results', $results);
    }

    public function storeWebhook(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:2048'],
            'events' => ['nullable', 'array'],
            'signing_secret' => ['nullable', 'string', 'max:255'],
            'active' => ['boolean'],
        ]);

        $webhook = IntegrationWebhook::create([
            'name' => $data['name'],
            'url' => $data['url'],
            'events' => $data['events'] ?? ['invoice.paid', 'subscription.updated'],
            'signing_secret' => $data['signing_secret'] ?? null,
            'active' => $request->boolean('active', true),
        ]);

        ActivityLog::record('admin.integrations.webhook.created', subject: $webhook);

        return back()->with('status', 'integration-webhook-created');
    }

    public function toggleWebhook(IntegrationWebhook $webhook): RedirectResponse
    {
        $webhook->update(['active' => ! $webhook->active]);
        ActivityLog::record('admin.integrations.webhook.toggled', subject: $webhook);

        return back();
    }

    public function storeApiKey(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'scopes' => ['nullable', 'array'],
        ]);

        $issued = IntegrationApiKey::issue($data['name'], $data['scopes'] ?? ['read'], $request->user()->id);
        ActivityLog::record('admin.integrations.api_key.created', subject: $issued['model']);

        return back()->with([
            'status' => 'integration-api-key-created',
            'integration_api_key_plain' => $issued['plain'],
        ]);
    }

    public function revokeApiKey(IntegrationApiKey $apiKey): RedirectResponse
    {
        $apiKey->update(['revoked_at' => now()]);
        ActivityLog::record('admin.integrations.api_key.revoked', subject: $apiKey);

        return back()->with('status', 'integration-api-key-revoked');
    }

    public function resolveFailure(IntegrationFailure $failure): RedirectResponse
    {
        $failure->update(['status' => 'resolved', 'resolved_at' => now()]);
        ActivityLog::record('admin.integrations.failure.resolved', subject: $failure);

        return back();
    }

    public function storeProvider(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:64', Rule::unique('integration_providers', 'slug')],
            'name' => ['required', 'string', 'max:255'],
            'purpose' => ['nullable', 'string'],
            'data_access' => ['nullable', 'string'],
            'operational_status' => ['required', Rule::in(['active', 'deprecated', 'disabled'])],
            'compliance_doc_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $provider = IntegrationProvider::create($data);
        ActivityLog::record('admin.integrations.provider.created', subject: $provider);

        return back()->with('status', 'integration-provider-saved');
    }

    public function updateProvider(Request $request, IntegrationProvider $provider): RedirectResponse
    {
        $data = $request->validate([
            'operational_status' => ['required', Rule::in(['active', 'deprecated', 'disabled'])],
            'compliance_doc_url' => ['nullable', 'url', 'max:2048'],
            'purpose' => ['nullable', 'string'],
            'data_access' => ['nullable', 'string'],
        ]);

        $provider->update($data);
        ActivityLog::record('admin.integrations.provider.updated', subject: $provider);

        return back();
    }
}
