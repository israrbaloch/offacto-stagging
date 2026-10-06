<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Status;
use App\Support\RecurringInvoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GenerateRecurringInvoices extends Command
{
    protected $signature = 'invoices:generate-recurring';

    protected $description = 'Generate draft invoices from recurring templates (no send or payment)';

    public function handle(): int
    {
        $due = Invoice::query()
            ->where('is_recurring', true)
            ->whereNotNull('next_run_at')
            ->whereDate('next_run_at', '<=', now())
            ->with(['items', 'attachments'])
            ->get();

        foreach ($due as $template) {
            DB::transaction(function () use ($template) {
                $draftStatus = Status::forTable('invoices')->where('name', 'Draft')->first();
                $invoiceDate = now()->startOfDay();

                $invoice = Invoice::create([
                    'company_id' => $template->company_id,
                    'customer_id' => $template->customer_id,
                    'offer_id' => $template->offer_id,
                    'invoice_number' => $this->nextNumber($template),
                    'invoice_date' => $invoiceDate,
                    'due_date' => $invoiceDate->copy()->addDays(30),
                    'intro' => $template->intro,
                    'desc' => $template->desc,
                    'notes' => $template->notes,
                    'email_message' => $template->email_message,
                    'ip_transfer_type' => $template->ip_transfer_type,
                    'status' => $draftStatus?->id,
                    'payment_status' => Invoice::PAYMENT_UNPAID,
                    'is_recurring' => false,
                    'parent_invoice_id' => $template->id,
                ]);

                foreach ($template->attachments as $attachment) {
                    if (! Storage::disk('public')->exists($attachment->file_path)) {
                        continue;
                    }
                    $basename = basename($attachment->file_path);
                    $newPath = 'invoice-attachments/'.$invoice->id.'/'.$basename;
                    Storage::disk('public')->copy($attachment->file_path, $newPath);
                    $invoice->attachments()->create([
                        'file_path' => $newPath,
                        'original_name' => $attachment->original_name,
                    ]);
                }

                foreach ($template->items as $item) {
                    $invoiceItem = new InvoiceItem([
                        'service_id' => $item->service_id,
                        'description' => $item->description,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                    ]);
                    $invoiceItem->calculateTotal();
                    $invoice->items()->save($invoiceItem);
                }

                $scheduledFrom = $template->next_run_at ?? now();
                $template->update([
                    'next_run_at' => RecurringInvoice::nextRunAfter($scheduledFrom, $template->recurring_interval),
                ]);
            });
        }

        $this->info('Generated '.$due->count().' recurring draft invoice(s).');

        return self::SUCCESS;
    }

    private function nextNumber(Invoice $template): string
    {
        return app(\App\Services\NumberingSeriesService::class)->nextForCompany($template->company_id, 'invoices');
    }
}
