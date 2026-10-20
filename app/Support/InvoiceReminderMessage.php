<?php

namespace App\Support;

use App\Models\Invoice;
use App\Models\SiteSetting;

final class InvoiceReminderMessage
{
    /**
     * @return array{subject: string, body: string}
     */
    public static function resolve(Invoice $invoice, ?string $customMessage = null): array
    {
        $templates = SiteSetting::get('email_templates', []);
        $template = is_array($templates) ? ($templates['payment_reminder'] ?? []) : [];
        $subject = is_array($template) ? (string) ($template['subject'] ?? '') : '';
        $templateBody = is_array($template) ? (string) ($template['body'] ?? '') : '';

        if ($subject === '') {
            $subject = 'Payment reminder: Invoice #'.($invoice->invoice_number ?? 'N/A');
        }

        $body = filled($customMessage)
            ? $customMessage
            : ($templateBody !== ''
                ? $templateBody
                : self::defaultBody($invoice));

        $body = InvoiceMessage::merge($body, $invoice);

        return [
            'subject' => InvoiceMessage::merge($subject, $invoice),
            'body' => $body,
        ];
    }

    private static function defaultBody(Invoice $invoice): string
    {
        $due = $invoice->due_date?->format('F j, Y') ?? '—';
        $amount = number_format((float) $invoice->amount_due, 2);

        return '<p>This is a friendly reminder that invoice <strong>#'.e($invoice->invoice_number).'</strong> '
            .'is due on '.$due.'.</p>'
            .'<p>Outstanding amount: <strong>€ '.$amount.'</strong></p>'
            .'<p>View invoice: #INVOICELINK#</p>'
            .(filled($invoice->mollie_checkout_url) ? '<p>Pay online: #PAYLINK#</p>' : '');
    }
}
