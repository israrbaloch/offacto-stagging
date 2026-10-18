<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectPlatformAdmin
{
    /**
     * Platform admins use their own shell. Keep them out of the company workspace.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
