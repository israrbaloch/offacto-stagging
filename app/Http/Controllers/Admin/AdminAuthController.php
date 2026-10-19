<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function login(): Response
    {
        return Inertia::render('Admin/Auth/Login', [
            'allowRegistration' => SiteSetting::getBoolean('allow_user_registration', true),
        ]);
    }

    public function mfaChallenge(): Response
    {
        return Inertia::render('Admin/Auth/MfaVerify', [
            'hint' => 'Enter the verification code from your authenticator app or security key challenge.',
        ]);
    }
}
