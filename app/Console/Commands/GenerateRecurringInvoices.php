<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Status;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'invoices:generate-recurring';

    protected $description = 'Generate draft invoices from recurring templates';

    public function handle(): int
    {
        $due = Invoice::query()
            ->where('is_recurring', true)
            ->whereNotNull('next_run_at')
            ->whereDate('next_run_at', '<=', now())
            ->with(['items', 'customer'])
            ->get();

        foreach ($due as $template) {
            DB::transaction(function () use ($template) {
                $draftStatus = Status::forTable('invoices')->where('name', 'Draft')->first();

                $invoice = Invoice::create([
                    'company_id' => $template->company_id,
                    'customer_id' => $template->customer_id,
                    'invoice_number' => $this->nextNumber($template),
                    'invoice_date' => now(),
                    'due_date' => now()->addDays(30),
                    'intro' => $template->intro,
                    'desc' => $template->desc,
                    'notes' => $template->notes,
                    'status' => $draftStatus?->id,
                    'payment_status' => Invoice::PAYMENT_UNPAID,
                    'parent_invoice_id' => $template->id,
                ]);

                foreach ($template->items as $item) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'service_id' => $item->service_id,
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ]);
                }

                $template->update([
                    'next_run_at' => $this->nextRunDate($template->recurring_interval),
                ]);
            });
        }

        $this->info('Generated '.$due->count().' recurring invoice(s).');

        return self::SUCCESS;
    }

    private function nextNumber(Invoice $template): string
    {
        return app(\App\Services\NumberingSeriesService::class)->nextForCompany($template->company_id, 'invoices');
    }

    private function nextRunDate(?string $interval): \Illuminate\Support\Carbon
    {
        return match ($interval) {
            'weekly' => now()->addWeek(),
            'yearly' => now()->addYear(),
            default => now()->addMonth(),
        };
    }
}
