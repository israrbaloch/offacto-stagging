<?php

namespace App\Support;

class PlatformLocales
{
    /** @return list<string> */
    public static function codes(): array
    {
        return ['en', 'fr', 'nl'];
    }

    public static function emptyLabels(): array
    {
        return array_fill_keys(self::codes(), '');
    }
}
