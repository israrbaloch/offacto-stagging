<?php

namespace App\Services;

use Barryvdh\DomPDF\PDF;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class PdfZipExportService
{
    /**
     * @param  Collection<int, mixed>  $items
     * @param  callable(mixed): PDF  $pdfFactory
     * @param  callable(mixed): string  $entryName
     */
    public function download(Collection $items, callable $pdfFactory, callable $entryName, string $zipFilename): StreamedResponse
    {
        return response()->streamDownload(function () use ($items, $pdfFactory, $entryName) {
            $tmpZip = tempnam(sys_get_temp_dir(), 'pdfzip');
            $zip = new ZipArchive();
            $zip->open($tmpZip, ZipArchive::OVERWRITE | ZipArchive::CREATE);

            foreach ($items as $item) {
                $pdf = $pdfFactory($item);
                $zip->addFromString($entryName($item), $pdf->output());
            }

            $zip->close();
            readfile($tmpZip);
            @unlink($tmpZip);
        }, $zipFilename, [
            'Content-Type' => 'application/zip',
        ]);
    }
}
