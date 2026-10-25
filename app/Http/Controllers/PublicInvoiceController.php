<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\SiteSetting;
use App\Support\OfferSignature;
use App\Support\PublicStorage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PublicInvoiceController extends Controller
{
    public function show(string $token): InertiaResponse
    {
        $invoice = Invoice::where('share_token', $token)
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation', 'blocks'])
            ->firstOrFail();

        $status = strtolower((string) $invoice->statusRelation?->name);
        $isDraft = $status === 'draft';

        return Inertia::render('Invoices/Public', [
            'invoice' => $this->payload($invoice),
            'token' => $token,
            'canAcknowledge' => ! $isDraft
                && ! $invoice->customer_acknowledged_at
                && $invoice->payment_status !== Invoice::PAYMENT_PAID,
        ]);
    }

    public function acknowledge(Request $request, string $token): RedirectResponse
    {
        $invoice = Invoice::where('share_token', $token)->firstOrFail();

        if ($invoice->customer_acknowledged_at) {
            return back()->with('error', 'This invoice was already acknowledged.');
        }

        $request->validate([
            'signature' => ['nullable', 'string', 'max:3500000'],
            'signature_file' => ['nullable', 'file', 'mimes:png', 'max:2048'],
            'voice_note' => ['nullable', 'file', 'mimes:mp3,wav,webm,ogg,m4a', 'max:5120'],
        ]);

        $voicePath = $invoice->voice_note_path;
        if ($request->hasFile('voice_note')) {
            if ($voicePath) {
                Storage::disk('public')->delete($voicePath);
            }
            $voicePath = $request->file('voice_note')->store('invoice-voice/'.$invoice->id, 'public');
        }

        $signatureData = OfferSignature::normalize(
            $request->input('signature'),
            $request->file('signature_file'),
        );

        $invoice->update([
            'customer_acknowledged_at' => now(),
            'signature_data' => $signatureData,
            'voice_note_path' => $voicePath,
        ]);

        return back()->with('status', 'invoice-acknowledged');
    }

    public function preview(string $token): Response
    {
        $invoice = $this->invoiceForPdf($token);
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4');

        $filename = 'invoice-'.($invoice->invoice_number ?? $invoice->id).'.pdf';

        return $pdf->stream($filename);
    }

    public function download(string $token): Response
    {
        $invoice = $this->invoiceForPdf($token);
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4');

        $filename = 'invoice-'.($invoice->invoice_number ?? $invoice->id).'.pdf';

        return $pdf->download($filename);
    }

    private function invoiceForPdf(string $token): Invoice
    {
        return Invoice::where('share_token', $token)
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation', 'blocks', 'offer'])
            ->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Invoice $invoice): array
    {
        $settings = $invoice->company?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];

        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'invoice_date' => $invoice->invoice_date?->toDateString(),
            'due_date' => $invoice->due_date?->toDateString(),
            'intro' => $invoice->intro,
            'desc' => $invoice->desc,
            'notes' => $invoice->notes,
            'payment_status' => $invoice->payment_status,
            'amount_due' => $invoice->amount_due,
            'total' => $invoice->total,
            'subtotal' => $invoice->subtotal,
            'tax_amount' => $invoice->tax_amount,
            'customer_acknowledged_at' => $invoice->customer_acknowledged_at?->toIso8601String(),
            'mollie_checkout_url' => $invoice->mollie_checkout_url,
            'company' => [
                'name' => $invoice->company?->company_name,
                'email' => $invoice->company?->email,
                'street' => $invoice->company?->street,
                'house' => $invoice->company?->house,
                'postal_code' => $invoice->company?->postal_code,
                'city' => $invoice->company?->city,
                'logo_url' => PublicStorage::url($settings?->invoice_logo),
                'theme' => [
                    'primary' => $theme['primary'] ?? '#4054b2',
                    'secondary' => $theme['secondary'] ?? '#0f172a',
                ],
                'invoice_template' => $settings?->invoice_template ?? 'classic',
            ],
            'customer' => [
                'name' => $invoice->customer?->org_name
                    ?: trim(($invoice->customer?->first_name.' '.$invoice->customer?->surname)),
                'attn' => $invoice->customer?->org_name
                    ? trim(($invoice->customer?->first_name.' '.$invoice->customer?->surname))
                    : null,
                'email' => $invoice->customer?->email,
                'address' => $invoice->customer?->office_address,
            ],
            'items' => $invoice->items->map(fn ($item) => [
                'description' => $item->description,
                'service_name' => $item->service?->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total' => $item->total,
                'billing_mode' => $item->service?->billing_mode ?? 'fixed',
                'unit' => $item->service?->unit ?? '',
            ]),
            'blocks' => $invoice->blocks?->map(function ($block) {
                $content = $block->content ?? [];
                if ($block->type === 'image' && ! empty($content['path']) && empty($content['url'])) {
                    $content['url'] = PublicStorage::url($content['path']);
                }

                return [
                    'id' => $block->id,
                    'type' => $block->type,
                    'content' => $content,
                ];
            }),
        ];
    }
}
