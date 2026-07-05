<?php

namespace App\Providers;

use App\Models\User;
use App\Support\AccessPermissions;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
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
        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(5)->by(
                $request->ip().'|'.strtolower((string) $request->input('login'))
            );
        });

        Gate::before(function (User $user, string $ability): ?bool {
            if (!AccessPermissions::exists($ability)) {
                return null;
            }

            return AccessPermissions::can($user, $ability);
        });
    }
}
