<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;
use Throwable;
use App\Models\User;
use App\Models\Artist;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        try {
            if (Schema::hasTable('users')) {
                View::share('currentUser', User::first());
            }
        } catch (Throwable $e) {
            View::share('currentUser', null);
        }

        View::composer('app.sidebar', function ($view) {
            try {
                if (!Schema::hasTable('artists')) {
                    $view->with([
                        'artists' => collect(),
                        'hasMore' => false,
                    ]);
                    return;
                }

                $artists = Artist::inRandomOrder()->limit(10)->get();
                $hasMore = Artist::count() > 10;

                $view->with([
                    'artists' => $artists,
                    'hasMore' => $hasMore,
                ]);
            } catch (Throwable $e) {
                $view->with([
                    'artists' => collect(),
                    'hasMore' => false,
                ]);
            }
        });
    }
}
