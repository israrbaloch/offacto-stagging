<?php

namespace App\Support;

class CompanyDocumentFonts
{
    /** @var array<string, string> */
    private const STACKS = [
        'inter' => 'Inter, DejaVu Sans, sans-serif',
        'georgia' => 'Georgia, DejaVu Serif, serif',
        'helvetica' => 'Helvetica, Arial, DejaVu Sans, sans-serif',
        'courier_new' => 'Courier New, DejaVu Sans Mono, monospace',
    ];

    public static function normalize(?string $key): string
    {
        $id = strtolower(trim((string) $key));

        return array_key_exists($id, self::STACKS) ? $id : 'inter';
    }

    public static function cssFamily(?string $key): string
    {
        return self::STACKS[self::normalize($key)];
    }
}
