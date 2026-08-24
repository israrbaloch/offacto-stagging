<?php

namespace App\Support;

use App\Models\Offer;

class OfferMessage
{
    public static function merge(string $html, Offer $offer): string
    {
        $offer->loadMissing(['customer', 'company']);
        $customer = $offer->customer;
        $client = trim(($customer?->first_name.' '.$customer?->surname))
            ?: ($customer?->org_name ?: 'Client');
        $company = $offer->company?->company_name ?: 'our company';
        $link = url('/offers/'.$offer->id);

        return str_replace(
            ['#CLIENTNAME#', '#COMPANY#', '#OFFERLINK#'],
            [e($client), e($company), e($link)],
            $html
        );
    }
}
