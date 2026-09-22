<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\SiteSetting;
use App\Models\Status;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PublicOfferController extends Controller
{
    public function show(string $token): InertiaResponse
    {
        $offer = Offer::where('share_token', $token)
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation', 'blocks'])
            ->firstOrFail();

        $status = strtolower((string) $offer->statusRelation?->name);

        return Inertia::render('Offers/Public', [
            'offer' => $this->payload($offer),
            'token' => $token,
            'canRespond' => in_array($status, ['sent', 'pending', 'open'], true)
                && ! $offer->accepted_at
                && ! $offer->declined_at,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $offer = Offer::where('share_token', $token)->firstOrFail();

        if ($offer->declined_at) {
            return back()->with('error', 'This quotation was already declined.');
        }

        $voicePath = $offer->voice_note_path;
        if ($request->hasFile('voice_note')) {
            $request->validate(['voice_note' => ['file', 'mimes:mp3,wav,webm,ogg', 'max:10240']]);
            if ($voicePath) {
                Storage::disk('public')->delete($voicePath);
            }
            $voicePath = $request->file('voice_note')->store('offer-voice/'.$offer->id, 'public');
        }

        $accepted = Status::forTable('offers')->where('name', 'Accepted')->first();
        $offer->update([
            'status' => $accepted?->id ?? $offer->status,
            'accepted_at' => now(),
            'signature_data' => $request->input('signature'),
            'voice_note_path' => $voicePath,
        ]);

        return back()->with('status', 'offer-accepted');
    }

    public function decline(string $token): RedirectResponse
    {
        $offer = Offer::where('share_token', $token)->firstOrFail();

        if ($offer->accepted_at) {
            return back()->with('error', 'This quotation was already accepted.');
        }

        $offer->update(['declined_at' => now()]);

        return back()->with('status', 'offer-declined');
    }

    public function download(string $token): Response
    {
        $offer = Offer::where('share_token', $token)
            ->with(['customer', 'items.service', 'company.companySetting', 'statusRelation'])
            ->firstOrFail();

        $pdf = Pdf::loadView('pdf.offer', [
            'offer' => $offer,
            'vatRate' => SiteSetting::getInteger('default_vat_rate', 21),
        ])->setPaper('a4');

        $filename = 'quotation-'.($offer->offer_number ?? $offer->id).'.pdf';

        return $pdf->download($filename);
    }

    private function payload(Offer $offer): array
    {
        $settings = $offer->company?->companySetting;
        $theme = is_array($settings?->theme) ? $settings->theme : [];

        return [
            'id' => $offer->id,
            'offer_number' => $offer->offer_number,
            'offer_date' => $offer->offer_date?->toDateString(),
            'valid_until' => $offer->valid_until?->toDateString(),
            'intro' => $offer->intro,
            'desc' => $offer->desc,
            'status' => $offer->statusRelation?->name,
            'accepted_at' => $offer->accepted_at?->toIso8601String(),
            'declined_at' => $offer->declined_at?->toIso8601String(),
            'total' => $offer->total,
            'subtotal' => $offer->subtotal,
            'tax_amount' => $offer->tax_amount,
            'company' => [
                'name' => $offer->company?->company_name,
                'logo_url' => $settings?->invoice_logo ? asset('storage/'.$settings->invoice_logo) : null,
                'theme' => [
                    'primary' => $theme['primary'] ?? '#4054b2',
                    'secondary' => $theme['secondary'] ?? '#0f172a',
                ],
            ],
            'customer' => [
                'name' => $offer->customer?->org_name
                    ?: trim(($offer->customer?->first_name.' '.$offer->customer?->surname)),
            ],
            'items' => $offer->items->map(fn ($item) => [
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->price,
                'total' => $item->total,
            ]),
            'blocks' => $offer->blocks?->map(fn ($block) => [
                'id' => $block->id,
                'type' => $block->type,
                'content' => $block->content,
            ]) ?? [],
        ];
    }
}
