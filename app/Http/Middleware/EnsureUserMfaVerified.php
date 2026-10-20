<?php

namespace App\Http\Middleware;

use App\Services\AdminMfaService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserMfaVerified
{
    public function __construct(private AdminMfaService $mfa) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || ! $this->mfa->appliesMfa($user)) {
            return $next($request);
        }

        if ($this->mfa->isVerified($request) && ! $request->session()->get('admin_mfa_must_reenroll')) {
            return $next($request);
        }

        if ($request->session()->get('admin_mfa_must_reenroll')) {
            return redirect()->route('two-factor.enroll');
        }

        if (! $this->mfa->confirmedCredential($user)) {
            return redirect()->route('two-factor.enroll');
        }

        return redirect()->route('two-factor.challenge');
    }
}
