<?php

use App\Http\Middleware\EnsureEmailVerifiedForSession;
use App\Http\Middleware\EnsureUserIsAuthenticated;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\PermissionMiddleware;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule): void {
        $schedule->command('invoices:generate-recurring')->daily();
        $schedule->command('invoices:payment-reminders')->daily();
        $schedule->command('subscriptions:process')->daily();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'webhooks/mollie',
        ]);
        $middleware->web(append: [
            SetLocale::class,
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'auth.check' => EnsureUserIsAuthenticated::class,
            'verified.email' => EnsureEmailVerifiedForSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
