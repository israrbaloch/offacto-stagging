<?php

namespace App\Support;

class PurchaseCategories
{
    /** @var list<string> */
    public const KEYS = [
        'telecom',
        'software',
        'subcontracting',
        'equipment_rental',
        'marketing',
        'office',
        'travel',
        'other',
    ];

    /** Categories whose VAT is deductible on the return. */
    public const DEDUCTIBLE = [
        'telecom',
        'software',
        'subcontracting',
        'equipment_rental',
        'marketing',
        'office',
        'travel',
        'other',
    ];

    public static function deductible(string $category): bool
    {
        return in_array($category, self::DEDUCTIBLE, true);
    }
}
