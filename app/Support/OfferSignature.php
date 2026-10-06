<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class OfferSignature
{
    public const MAX_BYTES = 2 * 1024 * 1024;

    private const DATA_URL_PREFIX = 'data:image/png;base64,';

    private const PNG_MAGIC = "\x89PNG\r\n\x1a\n";

    /**
     * @throws ValidationException
     */
    public static function normalize(?string $dataUrl, ?UploadedFile $file = null): ?string
    {
        if ($file !== null) {
            if (filled($dataUrl)) {
                throw ValidationException::withMessages([
                    'signature' => __('offers.signature_single_source'),
                ]);
            }

            return self::fromUploadedFile($file);
        }

        if (! filled($dataUrl)) {
            return null;
        }

        return self::fromDataUrl($dataUrl);
    }

    /**
     * @throws ValidationException
     */
    public static function fromDataUrl(string $dataUrl): string
    {
        if (! str_starts_with($dataUrl, self::DATA_URL_PREFIX)) {
            throw ValidationException::withMessages([
                'signature' => __('offers.signature_type_invalid'),
            ]);
        }

        $encoded = substr($dataUrl, strlen(self::DATA_URL_PREFIX));
        $binary = base64_decode($encoded, true);

        if ($binary === false) {
            throw ValidationException::withMessages([
                'signature' => __('offers.signature_invalid'),
            ]);
        }

        self::assertPngBinary($binary, 'signature');

        return self::DATA_URL_PREFIX.$encoded;
    }

    /**
     * @throws ValidationException
     */
    public static function fromUploadedFile(UploadedFile $file): string
    {
        $mime = $file->getMimeType();
        if (! in_array($mime, ['image/png', 'image/x-png'], true) || strtolower($file->getClientOriginalExtension()) !== 'png') {
            throw ValidationException::withMessages([
                'signature_file' => __('offers.signature_type_invalid'),
            ]);
        }

        $binary = file_get_contents($file->getRealPath());
        if ($binary === false) {
            throw ValidationException::withMessages([
                'signature_file' => __('offers.signature_invalid'),
            ]);
        }

        self::assertPngBinary($binary, 'signature_file');

        return self::DATA_URL_PREFIX.base64_encode($binary);
    }

    /**
     * @throws ValidationException
     */
    private static function assertPngBinary(string $binary, string $field): void
    {
        if (strlen($binary) > self::MAX_BYTES) {
            throw ValidationException::withMessages([
                $field => __('offers.signature_too_large', ['max' => '2 MB']),
            ]);
        }

        if (! str_starts_with($binary, self::PNG_MAGIC)) {
            throw ValidationException::withMessages([
                $field => __('offers.signature_type_invalid'),
            ]);
        }
    }
}
