<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Auth\RegisterEmailVerificationController;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerifiedForSession
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->hasVerifiedEmail()) {
            return $next($request);
        }

        if ($request->routeIs('register.verify', 'register.verify.*', 'logout')) {
            return $next($request);
        }

        Auth::logout();

        return RegisterEmailVerificationController::beginVerification($request, $user);
    }
}
