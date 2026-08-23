<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permissions
     */
    public function handle(Request $request, Closure $next, string $permissions): Response
    {
        if (!auth()->check()) {
            abort(403, 'Unauthorized. Please log in.');
        }

        $user = auth()->user();
        $permissionsArray = explode('|', $permissions);

        // Check if user has any of the required permissions
        $hasPermission = false;
        foreach ($permissionsArray as $permission) {
            if ($user->hasPermission(trim($permission))) {
                $hasPermission = true;
                break;
            }
        }

        if (!$hasPermission) {
            abort(403, 'Access denied. Insufficient permissions.');
        }

        return $next($request);
    }
}
