<?php

namespace App\Support;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketMessage;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class SupportTicketAttachmentHandler
{
    public const MAX_FILES = 5;

    public const MAX_KB = 5120;

    /**
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'images' => ['nullable', 'array', 'max:'.self::MAX_FILES],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,gif,webp', 'max:'.self::MAX_KB],
        ];
    }

    public static function persist(SupportTicket $ticket, SupportTicketMessage $message, Request $request): void
    {
        $files = $request->file('images', []);
        if (! is_array($files)) {
            return;
        }

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }
            self::storeOne($ticket, $message, $file);
        }
    }

    public static function storeOne(SupportTicket $ticket, SupportTicketMessage $message, UploadedFile $file): SupportTicketAttachment
    {
        $path = $file->store("support-tickets/{$ticket->id}", 'local');

        return SupportTicketAttachment::create([
            'support_ticket_message_id' => $message->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size_bytes' => (int) $file->getSize(),
        ]);
    }

    /**
     * @param  iterable<SupportTicketAttachment>  $attachments
     * @return list<array{id: int, name: string, url: string, mime_type: string}>
     */
    public static function serializeForTicket(SupportTicket $ticket, iterable $attachments): array
    {
        $out = [];
        foreach ($attachments as $attachment) {
            $out[] = [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'url' => route('support.tickets.attachments.show', [$ticket, $attachment]),
                'mime_type' => $attachment->mime_type,
            ];
        }

        return $out;
    }
}
