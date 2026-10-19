<?php

namespace App\Support;

final class MoneyAmount
{
    public static function fromCents(?int $cents): float
    {
        return round(($cents ?? 0) / 100, 2);
    }

    public static function toCents(float|int|string|null $major): int
    {
        $value = is_numeric($major) ? (float) $major : 0;

        return (int) round(max(0, $value) * 100);
    }
}
