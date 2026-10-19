<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformSettingsService;
use App\Support\PlatformLocales;
use App\Support\PlatformSettingsRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlatformSettingsController extends Controller
{
    public function index(): Response
    {
        $sections = PlatformSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Settings/Index', [
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): Response
    {
        $def = PlatformSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        return Inertia::render('Admin/Settings/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section),
            'nav' => PlatformSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $settings->handleUploads($section, $request);
        $data = $settings->validateSection($section, $request);
        $settings->persistSection($section, $data);

        return back()->with('status', 'platform-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section);

        return back()->with('status', 'platform-settings-reset');
    }
}
