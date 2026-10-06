<?php

namespace App\Support;

class BrandColors
{
    public static function primary(): string
    {
        return (string) config('branding.primary');
    }

    public static function secondary(): string
    {
        return (string) config('branding.secondary');
    }

    /**
     * @param  array<string, mixed>|null  $theme
     * @return array{primary: string, secondary: string}
     */
    public static function resolve(?array $theme = null): array
    {
        $theme = $theme ?? [];

        return [
            'primary' => filled($theme['primary'] ?? null) ? (string) $theme['primary'] : self::primary(),
            'secondary' => filled($theme['secondary'] ?? null) ? (string) $theme['secondary'] : self::secondary(),
        ];
    }
}
