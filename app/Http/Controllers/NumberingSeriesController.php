<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\NumberingSeries;
use App\Services\NumberingSeriesService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NumberingSeriesController extends Controller
{
    public function __construct(private NumberingSeriesService $numbering) {}

    public function store(Request $request): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company) {
            return back()->with('error', 'Select or create a company first.');
        }

        $data = $this->validated($request, $company);
        $series = $company->numberingSeries()->create($data);

        if (! $company->companySetting?->numbering_series) {
            CompanySetting::query()->updateOrCreate(
                ['company_id' => $company->id],
                ['numbering_series' => $series->id]
            );
        }

        return back()->with('status', 'numbering-series-created');
    }

    public function update(Request $request, NumberingSeries $series): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $series->company_id !== $company->id) {
            abort(403);
        }

        $series->update($this->validated($request, $company, $series));

        return back()->with('status', 'numbering-series-updated');
    }

    public function destroy(Request $request, NumberingSeries $series): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $series->company_id !== $company->id) {
            abort(403);
        }

        if ($company->numberingSeries()->count() <= 1) {
            return back()->with('error', 'You must keep at least one numbering series.');
        }

        $settings = $company->companySetting;
        if ($settings && (int) $settings->numbering_series === (int) $series->id) {
            $replacement = $company->numberingSeries()->where('id', '!=', $series->id)->orderBy('id')->first();
            $settings->update(['numbering_series' => $replacement?->id]);
        }

        $series->delete();

        return back()->with('status', 'numbering-series-deleted');
    }

    public function setDefault(Request $request, NumberingSeries $series): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $series->company_id !== $company->id) {
            abort(403);
        }

        CompanySetting::query()->updateOrCreate(
            ['company_id' => $company->id],
            ['numbering_series' => $series->id]
        );

        return back()->with('status', 'numbering-series-default');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, \App\Models\Company $company, ?NumberingSeries $series = null): array
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('numbering_series', 'name')
                    ->where(fn ($query) => $query->where('company_id', $company->id))
                    ->ignore($series?->id),
            ],
            'type' => ['required', 'in:invoices,credit_notes,both'],
            'prefix' => ['nullable', 'string', 'max:100'],
            'year_month' => ['nullable', 'in:year,year_short,year_month,year_short_month'],
            'separator' => ['nullable', 'in:_,-,/,.'],
            'digits' => ['required', 'in:2,3,4,5,6'],
            'next_number' => ['nullable', 'string', 'max:100'],
            'use_suffix' => ['sometimes', 'boolean'],
            'suffix' => ['nullable', 'string', 'max:100'],
            'restart_count' => ['required', 'in:never,annual,monthly'],
        ]);

        $data['use_suffix'] = $request->boolean('use_suffix');
        $data['prefix'] = $data['prefix'] ?? '';
        $data['next_number'] = $data['next_number'] ?? '1';

        if (! $data['use_suffix']) {
            $data['suffix'] = null;
        }

        return $data;
    }
}
