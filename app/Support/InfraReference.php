<?php

namespace App\Support;

final class InfraReference
{
    public static function make(string $prefix): string
    {
        return strtoupper($prefix).'-'.now()->format('ymd').'-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
    }
}
