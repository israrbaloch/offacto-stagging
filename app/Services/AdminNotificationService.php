<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class AdminNotificationService
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function notifyPlatformAdmins(string $title, string $body, ?string $href = null, string $kind = 'support', array $metadata = []): void
    {
        if (! Schema::hasTable('admin_notifications')) {
            return;
        }

        $admins = User::query()
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->where('name', 'admin'))
            ->get(['id']);

        foreach ($admins as $admin) {
            AdminNotification::create([
                'user_id' => $admin->id,
                'kind' => $kind,
                'title' => $title,
                'body' => $body,
                'href' => $href,
                'metadata' => $metadata,
            ]);
        }
    }

    /**
     * @return list<array{id: string, tone: string, title: string, body: string, href: string|null, at: string|null}>
     */
    public function unreadFeedForUser(int $userId, int $limit = 20): array
    {
        if (! Schema::hasTable('admin_notifications')) {
            return [];
        }

        return AdminNotification::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (AdminNotification $n) => [
                'id' => 'admin-notification-'.$n->id,
                'tone' => $n->kind === 'support' ? 'info' : 'neutral',
                'title' => $n->title,
                'body' => $n->body,
                'href' => $n->href,
                'at' => $n->created_at?->toIso8601String(),
            ])
            ->all();
    }

    public function markReadByFeedId(int $userId, string $feedId): void
    {
        if (! str_starts_with($feedId, 'admin-notification-')) {
            return;
        }
        $id = (int) substr($feedId, strlen('admin-notification-'));
        AdminNotification::query()
            ->where('user_id', $userId)
            ->whereKey($id)
            ->first()
            ?->markRead();
    }
}
