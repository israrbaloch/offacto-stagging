<?php

namespace App\Console\Commands;

use App\Services\InvoiceOverdueReminderService;
use Illuminate\Console\Command;

class SendInvoiceOverdueReminders extends Command
{
    protected $signature = 'invoices:send-overdue-reminders';

    protected $description = 'Send automated payment reminders for overdue invoices per platform schedule';

    public function handle(InvoiceOverdueReminderService $service): int
    {
        $result = $service->run();

        $this->info(sprintf('Overdue invoice reminders sent: %d, skipped: %d', $result['sent'], $result['skipped']));

        return self::SUCCESS;
    }
}
