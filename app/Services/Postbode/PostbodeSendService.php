<?php

namespace App\Services\Postbode;

use App\Models\CompanySetting;
use App\Models\Invoice;
use App\Models\Offer;
use App\Support\CompanyIntegrations;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class PostbodeSendService
{
    /**
     * @return array{uuid: ?string, status: ?string, reference: string}
     */
    public function sendInvoice(Invoice $invoice, CompanySetting $settings, bool $registeredOverride = null): array
    {
        $invoice->loadMissing(['customer', 'items.service', 'company.companySetting']);
        $pdfBytes = Pdf::loadView('pdf.invoice', ['invoice' => $invoice])->output();
        $filename = Str::slug($invoice->invoice_number ?: 'invoice-'.$invoice->id).'.pdf';
        $reference = $invoice->invoice_number ?: 'INV-'.$invoice->id;

        return $this->dispatch($settings, $pdfBytes, $filename, $reference, $registeredOverride);
    }

    /**
     * @return array{uuid: ?string, status: ?string, reference: string}
     */
    public function sendOffer(Offer $offer, CompanySetting $settings, bool $registeredOverride = null): array
    {
        $offer->loadMissing(['customer', 'items.service', 'company.companySetting', 'statusRelation']);
        $pdfBytes = Pdf::loadView('pdf.offer', ['offer' => $offer])->output();
        $filename = Str::slug($offer->offer_number ?: 'offer-'.$offer->id).'.pdf';
        $reference = $offer->offer_number ?: 'OFF-'.$offer->id;

        return $this->dispatch($settings, $pdfBytes, $filename, $reference, $registeredOverride);
    }

    /**
     * @return array{uuid: ?string, status: ?string, reference: string}
     */
    private function dispatch(
        CompanySetting $settings,
        string $pdfBytes,
        string $filename,
        string $reference,
        ?bool $registeredOverride,
    ): array {
        $token = CompanyIntegrations::postbodeToken($settings);
        if (! filled($token)) {
            throw new PostbodeApiException('Postbode API token is not configured for this workspace.');
        }

        $client = new PostbodeClient($token);
        $registered = $registeredOverride ?? (bool) $settings->postbode_registered;
        $sendNow = (bool) $settings->postbode_send_immediately;

        if ($settings->postbode_api_version === 'v1') {
            $mailboxId = (int) $settings->postbode_v1_mailbox_id;
            $response = $client->sendV1Letter($mailboxId, [
                'documents' => [[
                    'name' => $filename,
                    'content' => base64_encode($pdfBytes),
                ]],
                'envelope_id' => (int) ($settings->postbode_v1_envelope_id ?: 2),
                'country' => strtoupper($settings->postbode_default_country ?: 'NL'),
                'registered' => $registered,
                'send' => $sendNow,
            ]);

            return [
                'uuid' => isset($response['id']) ? (string) $response['id'] : null,
                'status' => isset($response['status']) ? (string) $response['status'] : ($sendNow ? 'queued' : 'draft'),
                'reference' => $reference,
            ];
        }

        $payload = [
            'mailbox' => $settings->postbode_mailbox_code,
            'envelope' => $settings->postbode_envelope_uuid,
            'customer_reference' => $reference,
            'documents' => [[
                'filename' => $filename,
                'content' => base64_encode($pdfBytes),
            ]],
            'send' => $sendNow,
        ];

        if ($registered) {
            $payload['registered'] = true;
        }

        $response = $client->createPostal($payload);
        $postal = is_array($response['data'] ?? null) ? $response['data'] : $response;

        return [
            'uuid' => isset($postal['uuid']) ? (string) $postal['uuid'] : (isset($postal['id']) ? (string) $postal['id'] : null),
            'status' => isset($postal['status']) ? (string) $postal['status'] : null,
            'reference' => $reference,
        ];
    }
}
