<?php

namespace App\Http\Middleware;

use App\Services\AdminMfaService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminMfaVerified
{
    public function __construct(private AdminMfaService $mfa) {}

    public function handle(Request $request, Closure $next): Response
    {
        $mfa = $this->mfa;
        $user = $request->user();
        if (! $user || ! $mfa->appliesMfa($user)) {
            return $next($request);
        }

        if ($mfa->isVerified($request) && ! $request->session()->get('admin_mfa_must_reenroll')) {
            return $next($request);
        }

        if ($request->session()->get('admin_mfa_must_reenroll')) {
            return redirect()->route('admin.mfa.enroll');
        }

        if (! $mfa->confirmedCredential($user)) {
            return redirect()->route('admin.mfa.enroll');
        }

        return redirect()->route('admin.mfa');
    }
}
