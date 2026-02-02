<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
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
        View::composer('app.sidebar', function ($view) {
            $view->with('artists', Artist::all());
        });
        View::share('currentUser', User::first());
    }
}
