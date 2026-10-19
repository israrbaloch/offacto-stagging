<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSecurityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string', 'max:64'],
        ]);

        $query = SecurityEvent::query()->with(['user:id,name,email']);

        if ($search = trim($filters['q'] ?? '')) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('email', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['type'])) {
            $query->where('event_type', $filters['type']);
        }

        $events = $query
            ->latest()
            ->paginate(30)
            ->withQueryString()
            ->through(fn (SecurityEvent $event) => [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'outcome' => $event->outcome,
                'email' => $event->email,
                'ip_address' => $event->ip_address,
                'user_agent' => $event->user_agent,
                'metadata' => $event->metadata,
                'created_at' => $event->created_at?->toIso8601String(),
                'user' => $event->user ? [
                    'id' => $event->user->id,
                    'name' => $event->user->name,
                    'email' => $event->user->email,
                ] : null,
            ]);

        return Inertia::render('Admin/Logs/Security', [
            'events' => $events,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
        ]);
    }
}
