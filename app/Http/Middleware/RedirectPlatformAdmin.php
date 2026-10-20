<?php

namespace App\Http\Middleware;

use App\Support\AdminAccess;
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
        $user = $request->user();

        if (
            $user
            && AdminAccess::canAccessAdminArea($user)
            && ! $user->hasRole('staff')
            && ! $request->session()->get('admin_workspace_company_id')
        ) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
