<?php

namespace App\Support;

class PublicStorage
{
    /**
     * Browser-safe URL for files on the public disk (works when APP_URL host differs from the one you use locally).
     */
    public static function url(?string $path): ?string
    {
        if (! filled($path)) {
            return null;
        }

        return '/storage/'.ltrim($path, '/');
    }

    /**
     * Absolute URL for emails and PDFs.
     */
    public static function absoluteUrl(?string $path): ?string
    {
        if (! filled($path)) {
            return null;
        }

        return asset('storage/'.ltrim($path, '/'));
    }
}
