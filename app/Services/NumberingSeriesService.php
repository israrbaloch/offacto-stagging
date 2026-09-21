<?php

namespace App\Services;

use App\Models\Company;
use App\Models\NumberingSeries;
use Illuminate\Support\Facades\DB;

class NumberingSeriesService
{
    public function periodToken(NumberingSeries $series): string
    {
        return match ($series->year_month) {
            'year' => now()->format('Y'),
            'year_short' => now()->format('y'),
            'year_month' => now()->format('Ym'),
            'year_short_month' => now()->format('ym'),
            default => '',
        };
    }

    public function preview(NumberingSeries $series): string
    {
        $prefix = (string) ($series->prefix ?? '');
        $period = $this->periodToken($series);
        $separator = (string) ($series->separator ?? '-');
        $digits = (int) ($series->digits ?: 4);
        $counter = max(1, (int) ($series->next_number ?: 1));
        $number = str_pad((string) $counter, $digits, '0', STR_PAD_LEFT);

        $formatted = $prefix.$period.$separator.$number;

        if ($series->use_suffix && filled($series->suffix)) {
            $formatted .= $series->suffix;
        }

        return $formatted;
    }

    public function allocateNext(NumberingSeries $series): string
    {
        return DB::transaction(function () use ($series) {
            $locked = NumberingSeries::query()->lockForUpdate()->findOrFail($series->id);
            $periodKey = $this->restartPeriodKey($locked);

            if ($this->shouldResetCounter($locked, $periodKey)) {
                $locked->next_number = '1';
            }

            $formatted = $this->preview($locked);
            $locked->next_number = (string) (((int) $locked->next_number) + 1);
            $locked->last_period = $periodKey ?: $locked->last_period;
            $locked->save();

            return $formatted;
        });
    }

    public function resolveForCompany(Company $company, string $context = 'invoices'): ?NumberingSeries
    {
        $settings = $company->companySetting;
        if ($settings?->numbering_series) {
            $selected = NumberingSeries::query()
                ->where('company_id', $company->id)
                ->find($settings->numbering_series);

            if ($selected && $this->seriesMatchesContext($selected, $context)) {
                return $selected;
            }
        }

        return $company->numberingSeries()
            ->orderBy('id')
            ->first(fn (NumberingSeries $series) => $this->seriesMatchesContext($series, $context));
    }

    protected function seriesMatchesContext(NumberingSeries $series, string $context): bool
    {
        return match ($context) {
            'invoices' => in_array($series->type, ['invoices', 'both'], true),
            'credit_notes' => in_array($series->type, ['credit_notes', 'both'], true),
            'offers' => in_array($series->type, ['both', 'invoices'], true),
            default => true,
        };
    }

    public function nextForCompany(int $companyId, string $context = 'invoices'): string
    {
        $company = Company::query()->findOrFail($companyId);
        $series = $this->resolveForCompany($company, $context);

        if (! $series) {
            return $this->legacyFallback($companyId, $context);
        }

        return $this->allocateNext($series);
    }

    protected function restartPeriodKey(NumberingSeries $series): string
    {
        return match ($series->restart_count ?? 'annual') {
            'monthly' => now()->format('Y-m'),
            'annual' => now()->format('Y'),
            default => '',
        };
    }

    protected function shouldResetCounter(NumberingSeries $series, string $periodKey): bool
    {
        if (($series->restart_count ?? 'never') === 'never' || $periodKey === '') {
            return false;
        }

        return filled($series->last_period) && $series->last_period !== $periodKey;
    }

    protected function legacyFallback(int $companyId, string $context): string
    {
        $year = now()->format('Y');
        $prefix = $context === 'credit_notes' ? 'CRN-' : ($context === 'invoices' ? 'INV-' : 'OFF-');
        $prefixPattern = rtrim($prefix, '-');

        if ($context === 'invoices' || $context === 'credit_notes') {
            $model = \App\Models\Invoice::class;
            $column = 'invoice_number';
        } else {
            $model = \App\Models\Offer::class;
            $column = 'offer_number';
        }

        $last = $model::query()
            ->where('company_id', $companyId)
            ->where($column, 'like', "{$prefixPattern}{$year}-%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = 1;
        if ($last && preg_match('/'.preg_quote($prefixPattern, '/').'\d{4}-(\d+)/', $last->{$column}, $matches)) {
            $nextNumber = (int) $matches[1] + 1;
        }

        return $prefixPattern.$year.'-'.str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
