<?php

namespace App\Http\Middleware;

use App\Support\AdminAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminArea
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! AdminAccess::canAccessAdminArea($request->user())) {
            abort(403, 'Access denied. Insufficient role permissions.');
        }

        return $next($request);
    }
}
