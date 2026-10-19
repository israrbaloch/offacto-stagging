<?php

namespace App\Support;

use Illuminate\Http\Request;

class RequestAudit
{
    public static function ip(?Request $request = null): ?string
    {
        $request ??= request();

        return $request?->ip();
    }

    public static function userAgent(?Request $request = null): ?string
    {
        $request ??= request();
        $agent = $request?->userAgent();

        if (! $agent) {
            return null;
        }

        return strlen($agent) > 500 ? substr($agent, 0, 500) : $agent;
    }
}
