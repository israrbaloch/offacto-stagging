<?php

namespace App\Support;

final class Money
{
    public static function round(float|int|string|null $amount): float
    {
        return round((float) $amount, 2);
    }

    public static function line(float|int|string|null $quantity, float|int|string|null $price): float
    {
        return self::round((float) $quantity * (float) $price);
    }

    public static function vat(float|int|string|null $subtotal, float|int|string|null $ratePercent): float
    {
        $cents = (int) round(((float) $subtotal) * 100);

        return round($cents * ((float) $ratePercent) / 100) / 100;
    }

    public static function total(float|int|string|null $subtotal, float|int|string|null $vat): float
    {
        return self::round((float) $subtotal + (float) $vat);
    }
}
