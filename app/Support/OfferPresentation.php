<?php

namespace App\Support;

use App\Models\Offer;

class OfferPresentation
{
    public static function forStaffDetail(Offer $offer): Offer
    {
        $offer->makeVisible(['signature_data']);
        self::appendAcceptanceMeta($offer);

        return $offer;
    }

    public static function forStaffList(Offer $offer): Offer
    {
        $offer->makeHidden(['signature_data']);
        self::appendAcceptanceMeta($offer, includeSignatureFlag: false);

        return $offer;
    }

    private static function appendAcceptanceMeta(Offer $offer, bool $includeSignatureFlag = true): void
    {
        $offer->setAttribute('voice_note_url', PublicStorage::url($offer->voice_note_path));
        $offer->setAttribute(
            'has_acceptance_artifact',
            filled($offer->accepted_at)
                && (filled($offer->signature_data) || filled($offer->voice_note_path))
        );

        if ($includeSignatureFlag) {
            $offer->setAttribute('has_signature', filled($offer->signature_data));
        }
    }
}
