<?php

namespace App\Support;

final class DocumentBlockPdf
{
    /**
     * @param  array<string, mixed>|null  $content
     */
    public static function imageSrc(?array $content): ?string
    {
        if (! $content) {
            return null;
        }
        if (filled($content['url'] ?? null)) {
            return (string) $content['url'];
        }
        $path = $content['path'] ?? null;
        if (! is_string($path) || $path === '') {
            return null;
        }
        $full = public_path('storage/'.ltrim($path, '/'));

        return is_file($full) ? $full : null;
    }

    /**
     * @param  array<string, mixed>|null  $content
     * @return list<list<string>>
     */
    public static function tableRows(?array $content): array
    {
        if (! empty($content['rows']) && is_array($content['rows'])) {
            return array_map(
                fn ($row) => is_array($row) ? array_map(strval(...), $row) : [(string) $row],
                $content['rows'],
            );
        }

        return [];
    }
}
