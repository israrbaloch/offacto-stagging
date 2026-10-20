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
}
