<?php

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\PlaylistTrackController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.perform');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.perform');
});

Route::middleware('auth')->group(function () {
    Route::get('/', [UserController::class, 'index']);

    Route::get('/locale/{locale}', [HomeController::class, 'locale'])
        ->name('locale')
        ->where('locale', '[a-z]+');

    Route::get('/create', [MusicController::class, 'create'])->name('create')->middleware('admin');

    Route::get('/artists', [ArtistController::class, 'index'])->name('artists.index');
    Route::get('/musics', [MusicController::class, 'index'])->name('musics.index');
    Route::get('/playlist', [PlaylistController::class, 'index'])->name('playlist.index');

    Route::post('/artists', [ArtistController::class, 'store'])->name('artists.store')->middleware('admin');
    Route::post('/musics', [MusicController::class, 'store'])->name('musics.store')->middleware('admin');
    Route::post('/playlist-tracks', [PlaylistTrackController::class, 'store'])->name('playlist-tracks.store');

    Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');
});
