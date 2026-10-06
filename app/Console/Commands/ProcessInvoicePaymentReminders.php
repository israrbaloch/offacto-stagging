<?php

namespace App\Console\Commands;

use App\Mail\InvoiceReminder;
use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ProcessInvoicePaymentReminders extends Command
{
    protected $signature = 'invoices:payment-reminders';

    protected $description = 'Send scheduled payment reminders for unpaid invoices';

    public function handle(): int
    {
        $today = now()->startOfDay();

        $invoices = Invoice::query()
            ->where('reminder_enabled', true)
            ->whereNull('reminder_sent_at')
            ->whereNotNull('reminder_send_on')
            ->whereDate('reminder_send_on', '<=', $today)
            ->whereIn('payment_status', [Invoice::PAYMENT_UNPAID, Invoice::PAYMENT_PARTIAL])
            ->with(['customer', 'items.service', 'company.companySetting', 'offer'])
            ->get();

        foreach ($invoices as $invoice) {
            $email = $invoice->customer?->email;
            if (! $email) {
                continue;
            }

            Mail::to($email)->send(new InvoiceReminder($invoice, ''));
            $invoice->update(['reminder_sent_at' => now()]);
            $this->info("Reminder sent for invoice {$invoice->invoice_number}");
        }

        return self::SUCCESS;
    }
}
