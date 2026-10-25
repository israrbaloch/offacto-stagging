<?php

namespace App\Http\Controllers;

use App\Models\CompanyLegalDocument;
use App\Models\CompanySetting;
use App\Models\Language;
use App\Services\NumberingSeriesService;
use App\Support\CompanyAccess;
use App\Support\CompanyIntegrations;
use App\Support\CompanyReminderPolicy;
use App\Support\PublicStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingsController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();

        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $section = (string) $request->query('section', 'company');
        $allowed = ['company', 'branding', 'numbering', 'integrations', 'reminders', 'legal', 'vat'];
        if (! in_array($section, $allowed, true)) {
            $section = 'company';
        }

        return Inertia::render('Company/Settings/Index', [
            'section' => $section,
            ...$this->sharedProps($company),
        ]);
    }

    public function updateVatRegime(Request $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }

        $data = $request->validate([
            'vat_regime' => ['required', 'string', 'in:small_business_exemption,vat_registered,exempt_art44,mixed'],
        ]);

        $company->update(['vat_regime' => $data['vat_regime']]);

        return back()->with('status', 'company-vat-regime-saved');
    }

    public function updateReminders(Request $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }

        $data = $request->validate([
            'automated_reminders_enabled' => ['required', 'boolean'],
            'stages' => ['required', 'array', 'min:1', 'max:5'],
            'stages.*.days' => ['required', 'integer', 'min:1', 'max:365'],
            'stages.*.body' => ['nullable', 'string', 'max:5000'],
            'grace_days' => ['sometimes', 'integer', 'min:0', 'max:90'],
        ]);

        $stages = \App\Support\InvoiceReminderTemplate::normalizeStages($data['stages']);
        $days = array_column($stages, 'days');

        $settings = $this->ensureCompanySettings($company);
        $settings->update([
            'automated_reminders_enabled' => $data['automated_reminders_enabled'],
            'reminder_schedule' => CompanyReminderPolicy::normalizeDays($days),
            'reminder_stages' => $stages,
            'reminder_grace_days' => $data['grace_days'] ?? 0,
        ]);

        return back()->with('status', 'company-reminders-saved');
    }

    public function updateLegalDocument(Request $request, CompanyLegalDocument $document): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }
        if (! $company || $document->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validate([
            'attach_to_quotes_default' => ['sometimes', 'boolean'],
            'attach_to_invoices_default' => ['sometimes', 'boolean'],
            'attach_new_customers_only' => ['sometimes', 'boolean'],
        ]);

        $document->update($data);

        return back()->with('status', 'legal-document-updated');
    }

    public function downloadLegalDocument(Request $request, CompanyLegalDocument $document): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $document->company_id !== $company->id) {
            abort(403);
        }

        return Storage::disk('public')->download($document->file_path, $document->original_name);
    }

    /**
     * @return array<string, mixed>
     */
    private function sharedProps(\App\Models\Company $company): array
    {
        $companySettings = $this->ensureCompanySettings($company);

        $numberingSeriesList = $company->numberingSeries()->orderBy('name')->get()->map(fn ($series) => [
            'id' => $series->id,
            'name' => $series->name,
            'type' => $series->type,
            'prefix' => $series->prefix,
            'year_month' => $series->year_month,
            'separator' => $series->separator,
            'digits' => $series->digits,
            'next_number' => $series->next_number,
            'use_suffix' => (bool) $series->use_suffix,
            'suffix' => $series->suffix,
            'restart_count' => $series->restart_count ?? 'annual',
            'preview' => app(NumberingSeriesService::class)->preview($series),
        ]);

        $companySettings->refresh();

        return [
            'company' => $company,
            'companySettings' => $companySettings,
            'invoiceLogoUrl' => PublicStorage::url($companySettings->invoice_logo),
            'numberingSeriesList' => $numberingSeriesList,
            'activeNumberingSeriesId' => $companySettings->numbering_series,
            'languages' => Language::all()->pluck('name', 'id'),
            'legalDocuments' => $company->legalDocuments()->latest()->get(),
            'integrations' => CompanyIntegrations::postbodeFormDefaults($companySettings, $company),
            'integrationLinks' => [
                'postbode_docs' => config('services.postbode.docs_url'),
                'postbode_tokens' => config('services.postbode.token_app_url'),
            ],
            'reminders' => CompanyReminderPolicy::formDefaults($company),
            'settingsBasePath' => '/company/settings',
        ];
    }

    private function ensureCompanySettings(\App\Models\Company $company): CompanySetting
    {
        $settings = $company->companySetting;
        if ($settings) {
            return $settings;
        }

        $company->ensureDefaults();

        return $company->fresh()->companySetting ?? CompanySetting::create([
            'company_id' => $company->id,
            'numbering_series' => $company->numberingSeries()->first()?->id ?? 1,
        ]);
    }
}
