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
        $allowed = ['company', 'branding', 'numbering', 'integrations', 'reminders', 'legal', 'terms'];
        if (! in_array($section, $allowed, true)) {
            $section = 'company';
        }

        return Inertia::render('Company/Settings/Index', [
            'section' => $section,
            ...$this->sharedProps($company),
        ]);
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
            'schedule' => ['required', 'array', 'min:1'],
            'schedule.*' => ['integer', 'min:1', 'max:365'],
            'grace_days' => ['required', 'integer', 'min:0', 'max:90'],
            'escalation' => ['nullable', 'string', 'max:5000'],
        ]);

        $settings = $this->ensureCompanySettings($company);
        $settings->update([
            'automated_reminders_enabled' => $data['automated_reminders_enabled'],
            'reminder_schedule' => CompanyReminderPolicy::normalizeDays($data['schedule']),
            'reminder_grace_days' => $data['grace_days'],
            'reminder_escalation_text' => $data['escalation'] ?? '',
        ]);

        return back()->with('status', 'company-reminders-saved');
    }

    public function updateTerms(Request $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }

        $data = $request->validate([
            'terms_content' => ['required', 'array'],
            'terms_content.en' => ['nullable', 'string', 'max:50000'],
            'terms_content.fr' => ['nullable', 'string', 'max:50000'],
            'terms_content.nl' => ['nullable', 'string', 'max:50000'],
        ]);

        $settings = $this->ensureCompanySettings($company);
        $settings->update(['terms_content' => $data['terms_content']]);

        return back()->with('status', 'company-terms-saved');
    }

    public function storeLegalDocument(Request $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }

        $data = $request->validate([
            'type' => ['required', 'in:terms,contract,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'attach_to_quotes_default' => ['sometimes', 'boolean'],
        ]);

        $path = $request->file('file')->store('legal/'.$company->id, 'public');

        CompanyLegalDocument::create([
            'company_id' => $company->id,
            'type' => $data['type'],
            'title' => filled($data['title'] ?? null) ? $data['title'] : null,
            'file_path' => $path,
            'original_name' => $request->file('file')->getClientOriginalName(),
            'attach_to_quotes_default' => $request->boolean('attach_to_quotes_default'),
        ]);

        return back()->with('status', 'legal-document-uploaded');
    }

    public function updateLegalDocument(Request $request, CompanyLegalDocument $document): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $document->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validate([
            'attach_to_quotes_default' => ['sometimes', 'boolean'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $document->update($data);

        return back()->with('status', 'legal-document-updated');
    }

    public function destroyLegalDocument(Request $request, CompanyLegalDocument $document): RedirectResponse
    {
        $user = $request->user();
        $company = $user?->activeCompany();
        if ($deny = CompanyAccess::denyWrite($user, $company, false, 'settings.company')) {
            return $deny;
        }
        if (! $company || $document->company_id !== $company->id) {
            abort(403);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('status', 'legal-document-deleted');
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

        $terms = $companySettings->terms_content;
        if (! is_array($terms)) {
            $terms = ['en' => '', 'fr' => '', 'nl' => ''];
        }

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
            'termsContent' => [
                'en' => (string) ($terms['en'] ?? ''),
                'fr' => (string) ($terms['fr'] ?? ''),
                'nl' => (string) ($terms['nl'] ?? ''),
            ],
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
