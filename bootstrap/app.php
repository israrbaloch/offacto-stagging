<?php

use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureAdminArea;
use App\Http\Middleware\EnsureAdminMfaVerified;
use App\Http\Middleware\EnsureUserMfaVerified;
use App\Http\Middleware\EnsurePlatformNotInMaintenance;
use App\Http\Middleware\EnsureEmailVerifiedForSession;
use App\Http\Middleware\EnsureUserIsAuthenticated;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectPlatformAdmin;
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
        $schedule->command('invoices:send-overdue-reminders')->daily();
        $schedule->command('subscriptions:process')->daily();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'webhooks/mollie',
            'webhooks/inbound-email',
        ]);
        $middleware->web(append: [
            SetLocale::class,
            EnsureAccountIsActive::class,
            EnsurePlatformNotInMaintenance::class,
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'auth.check' => EnsureUserIsAuthenticated::class,
            'verified.email' => EnsureEmailVerifiedForSession::class,
            'redirect.admin' => RedirectPlatformAdmin::class,
            'admin.area' => EnsureAdminArea::class,
            'admin.mfa' => EnsureAdminMfaVerified::class,
            'mfa.verified' => EnsureUserMfaVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, \Illuminate\Http\Request $request) {
            if ($e->getStatusCode() !== 403) {
                return null;
            }
            $user = $request->user();
            if (! $user?->hasRole('admin')) {
                return null;
            }
            if ($request->expectsJson()) {
                return response()->json(['message' => $e->getMessage() ?: 'Access denied.'], 403);
            }
            if ($request->header('X-Inertia')) {
                return \Inertia\Inertia::render('Admin/AccessDenied', [
                    'message' => $e->getMessage() ?: 'You do not have permission to access this resource or perform this action.',
                ])->toResponse($request)->setStatusCode(403);
            }

            return null;
        });
    })->create();
