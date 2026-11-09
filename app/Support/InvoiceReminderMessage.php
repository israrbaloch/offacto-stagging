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
                : self::editorBody($invoice));

        $body = self::plainToHtml($body);
        $body = InvoiceMessage::merge($body, $invoice);

        return [
            'subject' => InvoiceMessage::merge($subject, $invoice),
            'body' => $body,
        ];
    }

    /**
     * Plain text shown in the reminder box. The mailer turns it into HTML.
     */
    public static function editorBody(Invoice $invoice): string
    {
        $due = $invoice->due_date
            ? $invoice->due_date->copy()->locale(app()->getLocale())->translatedFormat('j F Y')
            : '—';
        $amount = number_format((float) $invoice->amount_due, 2, '.', '');
        $number = $invoice->invoice_number ?: '—';

        $body = __('invoices.reminder_default_body', [
            'number' => $number,
            'due' => $due,
            'amount' => $amount,
        ]);

        if (filled($invoice->mollie_checkout_url)) {
            $body .= "\n\n".__('invoices.reminder_default_pay');
        }

        return $body;
    }

    public static function plainToHtml(string $body): string
    {
        if (str_contains($body, '<')) {
            return $body;
        }

        $escaped = e($body);
        $paragraphs = preg_split("/\n{2,}/", $escaped) ?: [];

        return collect($paragraphs)
            ->map(fn (string $paragraph) => '<p>'.nl2br($paragraph, false).'</p>')
            ->implode('');
    }
}
