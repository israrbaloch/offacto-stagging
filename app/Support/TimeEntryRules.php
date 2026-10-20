<?php

namespace App\Support;

use App\Models\Company;
use App\Models\Service;
use Illuminate\Validation\ValidationException;

final class TimeEntryRules
{
    public static function assertHourlyServiceForCompany(?Service $service, Company $company): void
    {
        if (! $service || $service->company_id !== $company->id) {
            throw ValidationException::withMessages([
                'service_id' => ['Select a valid service for this company.'],
            ]);
        }

        if (! ServiceBilling::isHourly($service)) {
            throw ValidationException::withMessages([
                'service_id' => ['Time can only be logged against hourly services.'],
            ]);
        }
    }
}
