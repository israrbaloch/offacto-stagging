<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class WorkspaceNotificationController extends Controller
{
    public function markAllRead(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! Schema::hasTable('admin_notifications')) {
            return back();
        }

        AdminNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }
}
