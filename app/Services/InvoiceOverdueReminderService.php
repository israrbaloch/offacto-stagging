<?php

namespace App\Services;

use App\Mail\InvoiceReminder;
use App\Models\Invoice;
use App\Support\CommunicationDeliveryLogger;
use App\Support\CompanyReminderPolicy;
use App\Support\InvoiceOverdueReminderPolicy;
use App\Support\InvoiceReminderMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class InvoiceOverdueReminderService
{
    /**
     * @return array{sent: int, skipped: int}
     */
    public function run(): array
    {
        if (! InvoiceOverdueReminderPolicy::jobsEnabled()) {
            return ['sent' => 0, 'skipped' => 0];
        }

        $sent = 0;
        $skipped = 0;

        Invoice::query()
            ->whereNotNull('due_date')
            ->whereIn('payment_status', [Invoice::PAYMENT_UNPAID, Invoice::PAYMENT_PARTIAL])
            ->whereDate('due_date', '<', now()->toDateString())
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation', 'blocks', 'payments'])
            ->chunkById(100, function ($invoices) use (&$sent, &$skipped) {
                foreach ($invoices as $invoice) {
                    if ($this->trySendForInvoice($invoice)) {
                        $sent++;
                    } else {
                        $skipped++;
                    }
                }
            });

        return ['sent' => $sent, 'skipped' => $skipped];
    }

    public function trySendForInvoice(Invoice $invoice): bool
    {
        if ($invoice->isPaid() || $invoice->isDraft()) {
            return false;
        }

        if ($invoice->parent_invoice_id && $invoice->total < 0) {
            return false;
        }

        if (InvoiceOverdueReminderPolicy::pauseOnDispute()) {
            $statusName = strtolower((string) ($invoice->statusRelation?->name ?? ''));
            if (in_array($statusName, ['cancelled', 'canceled'], true)) {
                return false;
            }
        }

        if (! CompanyReminderPolicy::automatedEnabled($invoice->company)) {
            return false;
        }

        if (InvoiceOverdueReminderPolicy::requiresPerInvoiceOptIn() && ! $invoice->reminder_enabled) {
            return false;
        }

        $email = trim((string) ($invoice->customer?->email ?? ''));
        if ($email === '') {
            return false;
        }

        if ($this->trySendScheduledDateReminder($invoice, $email)) {
            return true;
        }

        return $this->trySendOverdueMilestone($invoice, $email);
    }

    protected function trySendScheduledDateReminder(Invoice $invoice, string $email): bool
    {
        if (! $invoice->reminder_send_on) {
            return false;
        }

        $sendOn = $invoice->reminder_send_on instanceof Carbon
            ? $invoice->reminder_send_on->copy()->startOfDay()
            : Carbon::parse($invoice->reminder_send_on)->startOfDay();

        if (! now()->startOfDay()->equalTo($sendOn)) {
            return false;
        }

        if ($invoice->reminder_sent_at?->isToday()) {
            return false;
        }

        $this->deliver($invoice, $email, null, false);

        return true;
    }

    protected function trySendOverdueMilestone(Invoice $invoice, string $email): bool
    {
        $milestones = CompanyReminderPolicy::milestoneDaysAfterDue($invoice->company);
        $stage = (int) ($invoice->reminder_auto_stage ?? 0);
        if ($stage >= count($milestones)) {
            return false;
        }

        $daysPastDue = $this->daysPastDue($invoice);
        if ($daysPastDue === null || $daysPastDue < 0) {
            return false;
        }

        $threshold = CompanyReminderPolicy::graceDays($invoice->company) + $milestones[$stage];
        if ($daysPastDue < $threshold) {
            return false;
        }

        $isFinal = $stage === count($milestones) - 1;
        $stageBody = CompanyReminderPolicy::stageBody($invoice->company, $stage);
        $this->deliver($invoice, $email, $stageBody, $isFinal && $stageBody === null);
        $invoice->update(['reminder_auto_stage' => $stage + 1]);

        return true;
    }

    protected function daysPastDue(Invoice $invoice): ?int
    {
        if (! $invoice->due_date) {
            return null;
        }

        $due = $invoice->due_date->copy()->startOfDay();
        $today = now()->startOfDay();

        if ($today->lte($due)) {
            return 0;
        }

        return (int) $due->diffInDays($today);
    }

    public function deliver(Invoice $invoice, string $email, ?string $customMessage, bool $appendEscalation): void
    {
        if (filled($customMessage)) {
            $resolved = InvoiceReminderMessage::resolve($invoice, null);
            $body = \App\Support\InvoiceReminderTemplate::merge($customMessage, $invoice);
            $subject = $resolved['subject'];
        } else {
            $resolved = InvoiceReminderMessage::resolve($invoice, null);
            $body = $resolved['body'];
            $subject = $resolved['subject'];
        }

        if ($appendEscalation) {
            $extra = CompanyReminderPolicy::escalationSuffix($invoice->company);
            if ($extra !== '') {
                $body .= '<p>'.e($extra).'</p>';
            }
        }

        Mail::to($email)->send(new InvoiceReminder(
            $invoice,
            $body,
            $subject,
        ));

        CommunicationDeliveryLogger::emailSent(
            'payment_reminder',
            $email,
            $invoice->company_id,
            $subject,
            'invoice_overdue_auto',
        );

        $invoice->update(['reminder_sent_at' => now()]);
    }
}
