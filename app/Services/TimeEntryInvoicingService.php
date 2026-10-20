<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Status;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TimeEntryInvoicingService
{
    public function __construct() {}

    /**
     * @param  list<int>  $timeEntryIds
     */
    public function createDraftInvoice(
        Company $company,
        User $user,
        int $customerId,
        array $timeEntryIds,
    ): Invoice {
        $customer = Customer::query()
            ->where('company_id', $company->id)
            ->where('id', $customerId)
            ->firstOrFail();

        $entries = TimeEntry::query()
            ->forCompany($company->id)
            ->uninvoicedBillable()
            ->where('customer_id', $customer->id)
            ->whereIn('id', $timeEntryIds)
            ->with('service')
            ->get();

        if ($entries->count() !== count(array_unique($timeEntryIds))) {
            throw ValidationException::withMessages([
                'time_entry_ids' => ['One or more time entries are invalid, already invoiced, or belong to another customer.'],
            ]);
        }

        if ($entries->isEmpty()) {
            throw ValidationException::withMessages([
                'time_entry_ids' => ['Select at least one billable time entry.'],
            ]);
        }

        return DB::transaction(function () use ($company, $customer, $entries) {
            $defaultStatus = Status::where('for', 'invoices')->where('name', 'Draft')->first()
                ?? Status::forTable('invoices')->first();

            $invoice = Invoice::create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'invoice_number' => $this->nextInvoiceNumber($company->id),
                'invoice_date' => now(),
                'due_date' => now()->addDays(30),
                'status' => $defaultStatus?->id,
                'payment_status' => Invoice::PAYMENT_UNPAID,
            ]);

            /** @var Collection<int, Collection<int, TimeEntry>> $byService */
            $byService = $entries->groupBy('service_id');

            foreach ($byService as $serviceId => $group) {
                $service = $group->first()->service;
                $hours = round($group->sum(fn (TimeEntry $e) => $e->hours()), 2);
                if ($hours <= 0) {
                    continue;
                }

                $item = new InvoiceItem([
                    'service_id' => $serviceId,
                    'description' => $service?->name ?? 'Time',
                    'quantity' => $hours,
                    'price' => $service?->price ?? 0,
                ]);
                $item->calculateTotal();
                $invoice->items()->save($item);

                foreach ($group as $entry) {
                    $entry->update([
                        'status' => TimeEntry::STATUS_INVOICED,
                        'invoice_id' => $invoice->id,
                        'invoice_item_id' => $item->id,
                        'invoiced_at' => now(),
                    ]);
                    $item->timeEntries()->attach($entry->id);
                }
            }

            return $invoice->load(['items.service', 'customer']);
        });
    }

    public function releaseEntriesForInvoice(Invoice $invoice): void
    {
        $entryIds = TimeEntry::query()->where('invoice_id', $invoice->id)->pluck('id');
        if ($entryIds->isNotEmpty()) {
            DB::table('invoice_item_time_entry')->whereIn('time_entry_id', $entryIds)->delete();
        }

        TimeEntry::query()
            ->where('invoice_id', $invoice->id)
            ->update([
                'status' => TimeEntry::STATUS_COMPLETED,
                'invoice_id' => null,
                'invoice_item_id' => null,
                'invoiced_at' => null,
            ]);
    }

    private function nextInvoiceNumber(int $companyId): string
    {
        return app(NumberingSeriesService::class)->nextForCompany($companyId, 'invoices');
    }
}
