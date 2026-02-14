<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;
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
        if (Schema::hasTable('users')) {
            View::share('currentUser', User::first());
        }

        View::composer('app.sidebar', function ($view) {
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
        });
    }
}
