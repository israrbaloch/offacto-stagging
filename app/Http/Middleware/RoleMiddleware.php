<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (!auth()->check()) {
            abort(403, 'Unauthorized. Please log in.');
        }

        $user = auth()->user();
        $rolesArray = explode('|', $roles);

        // Check if user has any of the required roles
        $hasRole = false;
        foreach ($rolesArray as $role) {
            if ($user->hasRole(trim($role))) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            abort(403, 'Access denied. Insufficient role permissions.');
        }

        return $next($request);
    }
}
