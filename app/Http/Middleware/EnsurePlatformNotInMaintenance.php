<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlatformNotInMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('webhooks.*', 'payments.mollie.return')) {
            return $next($request);
        }

        if (! SiteSetting::getBoolean('maintenance_enabled', false)) {
            return $next($request);
        }

        $user = $request->user();
        if ($user?->hasRole('admin') && SiteSetting::getBoolean('maintenance_allow_admins', true)) {
            return $next($request);
        }

        if ($request->routeIs('admin.*') && $user?->hasRole('admin')) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => SiteSetting::get('maintenance_message', 'Maintenance in progress.')], 503);
        }

        return Inertia::render('Maintenance', [
            'message' => SiteSetting::get('maintenance_message', 'We are performing scheduled maintenance. Please try again shortly.'),
        ])->toResponse($request)->setStatusCode(503);
    }
}
