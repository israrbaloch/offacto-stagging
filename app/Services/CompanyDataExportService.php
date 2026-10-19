<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyDataExport;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class CompanyDataExportService
{
    public function generate(Company $company, User $requester, string $format = 'json'): CompanyDataExport
    {
        $export = CompanyDataExport::create([
            'company_id' => $company->id,
            'requested_by' => $requester->id,
            'format' => $format,
            'status' => 'pending',
        ]);

        try {
            $payload = $this->buildPayload($company);
            $relative = 'exports/company-'.$company->id.'-'.now()->format('Ymd-His').'.json';
            Storage::disk('local')->put($relative, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            $export->update([
                'status' => 'ready',
                'file_path' => $relative,
                'completed_at' => now(),
                'metadata' => [
                    'record_counts' => $payload['counts'] ?? [],
                ],
            ]);
        } catch (\Throwable $e) {
            $export->update([
                'status' => 'failed',
                'metadata' => ['error' => $e->getMessage()],
            ]);
        }

        return $export->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildPayload(Company $company): array
    {
        $company->load([
            'user:id,name,email',
            'statusRelation:id,name',
            'languageRelation:id,code,name',
            'companySetting',
        ]);

        return [
            'exported_at' => now()->toIso8601String(),
            'company' => $company->only([
                'id', 'company_name', 'legal_name', 'email', 'phone', 'vat_number',
                'street', 'house', 'postal_code', 'city', 'language', 'self_employed_activity',
                'is_active', 'subscription_plan', 'trial_starts_at', 'trial_ends_at',
                'subscription_started_at', 'subscription_ends_at', 'created_at',
            ]),
            'owner' => $company->user ? [
                'id' => $company->user->id,
                'name' => $company->user->name,
                'email' => $company->user->email,
            ] : null,
            'counts' => [
                'customers' => $company->customers()->count(),
                'services' => $company->services()->count(),
                'offers' => $company->offers()->count(),
                'invoices' => $company->invoices()->count(),
            ],
            'note' => 'Structured export without document file contents or line-item details.',
        ];
    }
}
