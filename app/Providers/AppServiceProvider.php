<?php

namespace App\Providers;

use App\Models\SupportTicket;
use App\Policies\SupportTicketPolicy;
use App\Support\PlatformMailConfigurator;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        $publicHtml = realpath(dirname($this->app->basePath()).DIRECTORY_SEPARATOR.'public_html');

        if ($publicHtml && is_file($publicHtml.DIRECTORY_SEPARATOR.'index.php')) {
            $this->app->usePublicPath($publicHtml);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            $hot = public_path('hot');
            if (is_file($hot) && is_writable($hot)) {
                @unlink($hot);
            }
        }

        Gate::policy(SupportTicket::class, SupportTicketPolicy::class);

        PlatformMailConfigurator::apply();

        Event::listen(MessageSending::class, function () {
            PlatformMailConfigurator::apply();
        });
    }
}
