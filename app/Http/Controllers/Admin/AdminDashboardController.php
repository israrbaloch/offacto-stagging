<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class AdminDashboardController extends Controller
{
    /** Legacy URL — platform overview lives on the main dashboard. */
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard');
    }
}
