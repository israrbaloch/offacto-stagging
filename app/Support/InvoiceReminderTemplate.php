<?php

namespace App\Support;

use App\Models\Invoice;

final class InvoiceReminderTemplate
{
    /**
     * @return list<array{days: int, body: string}>
     */
    public static function defaultStages(): array
    {
        return [
            [
                'days' => 3,
                'body' => 'Hi {firstname}, perhaps overlooked? Invoice {number} of {amount} was due {duedate}. Pay here: {paylink}',
            ],
            [
                'days' => 10,
                'body' => 'Dear {firstname}, we have not yet received payment for invoice {number} ({amount}, due {duedate}). You can pay securely here: {paylink}',
            ],
            [
                'days' => 20,
                'body' => 'Despite previous reminders, invoice {number} for {amount} remains unpaid (due {duedate}). Please pay today: {paylink}',
            ],
        ];
    }

    /**
     * @param  array<int, mixed>  $raw
     * @return list<array{days: int, body: string}>
     */
    public static function normalizeStages(array $raw): array
    {
        $stages = [];
        foreach ($raw as $row) {
            if (! is_array($row)) {
                continue;
            }
            $days = (int) ($row['days'] ?? 0);
            $body = trim((string) ($row['body'] ?? ''));
            if ($days < 1) {
                continue;
            }
            $stages[] = ['days' => min(365, $days), 'body' => $body];
        }

        if ($stages === []) {
            return self::defaultStages();
        }

        usort($stages, fn ($a, $b) => $a['days'] <=> $b['days']);

        return $stages;
    }

    public static function merge(string $template, Invoice $invoice): string
    {
        $invoice->loadMissing(['customer', 'company']);
        $customer = $invoice->customer;
        $firstname = trim((string) ($customer?->first_name ?? ''));
        if ($firstname === '' && $customer?->org_name) {
            $firstname = (string) $customer->org_name;
        }
        if ($firstname === '') {
            $firstname = 'there';
        }

        $number = $invoice->invoice_number ?: (string) $invoice->id;
        $amount = '€ '.number_format((float) $invoice->amount_due, 2, '.', ',');
        $duedate = $invoice->due_date?->format('j M Y') ?? '—';
        $paylink = filled($invoice->mollie_checkout_url)
            ? (string) $invoice->mollie_checkout_url
            : (method_exists($invoice, 'publicUrl') ? $invoice->publicUrl() : '');

        $merged = str_replace(
            ['{firstname}', '{number}', '{amount}', '{duedate}', '{paylink}'],
            [$firstname, $number, $amount, $duedate, $paylink],
            $template,
        );

        if (! str_contains($merged, '<')) {
            $html = e($merged);
            if ($paylink !== '') {
                $html = str_replace(e($paylink), '<a href="'.e($paylink).'">'.e($paylink).'</a>', $html);
            }
            $merged = '<p>'.$html.'</p>';
        }

        return InvoiceMessage::merge($merged, $invoice);
    }
}
