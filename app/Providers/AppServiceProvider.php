<?php

namespace App\Providers;

use App\Support\PlatformMailConfigurator;
use Illuminate\Support\Facades\Event;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PlatformMailConfigurator::apply();

        Event::listen(MessageSending::class, function () {
            PlatformMailConfigurator::apply();
        });
    }
}
