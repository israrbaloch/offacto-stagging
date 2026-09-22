<?php

namespace App\Services;

use App\Models\Country;
use App\Models\Customer;
use App\Models\Status;

class BriefingCustomerService
{
    public function resolveOrCreate(int $companyId, ?string $name, ?string $email): ?Customer
    {
        $email = $email ? strtolower(trim($email)) : null;
        if (! $email) {
            return null;
        }

        $existing = Customer::query()
            ->where('company_id', $companyId)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($existing) {
            return $existing;
        }

        return $this->createFromRespondent($companyId, $name ?? '', $email);
    }

    private function createFromRespondent(int $companyId, string $name, string $email): Customer
    {
        [$firstName, $surname] = $this->splitName($name);

        $statusId = Status::forTable('customers')->where('name', 'Prospect')->value('id')
            ?? Status::forTable('customers')->where('name', 'Active')->value('id')
            ?? Status::forTable('customers')->value('id');

        return Customer::create([
            'company_id' => $companyId,
            'first_name' => $firstName,
            'surname' => $surname,
            'type' => 'individual',
            'country_id' => Country::query()->orderBy('id')->value('id') ?? 12,
            'email' => $email,
            'status' => $statusId,
            'notes' => 'Auto-created from a briefing response.',
        ]);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $name): array
    {
        $name = trim($name);
        if ($name === '') {
            return ['Respondent', '-'];
        }

        $parts = preg_split('/\s+/', $name) ?: [];
        if (count($parts) === 1) {
            return [$parts[0], '-'];
        }

        $surname = array_pop($parts);

        return [implode(' ', $parts), $surname];
    }
}
