<?php

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\CategoryController;
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
    Route::get('/', [UserController::class, 'index'])->name('home');
    Route::get('/search', [UserController::class, 'search'])->name('search');

    Route::get('/locale/{locale}', [HomeController::class, 'locale'])
        ->name('locale')
        ->where('locale', '[a-z]+');

    Route::get('/create', [MusicController::class, 'create'])->name('create')->middleware('admin');
    
    Route::get('/artists', [ArtistController::class, 'index'])->name('artists.index');
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/musics', [MusicController::class, 'index'])->name('musics.index');
    Route::get('/playlist', [PlaylistController::class, 'index'])->name('playlist.index');
    
    // ADDED: Route::group()
    Route::group(['middleware' => 'admin'], function () {
        // admin ucin routlar
        Route::get('/artists/{artist}/edit', [ArtistController::class, 'edit'])->name('artists.edit');
        Route::patch('/artists/{artist}', [ArtistController::class, 'update'])->name('artists.update');
        Route::delete('/artists/{artist}', [ArtistController::class, 'destroy'])->name('artists.destroy');
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::get('/musics/{music}/edit', [MusicController::class, 'edit'])->name('musics.edit');
        Route::patch('/musics/{music}', [MusicController::class, 'update'])->name('musics.update');
        Route::delete('/musics/{music}', [MusicController::class, 'destroy'])->name('musics.destroy');
        Route::post('/artists', [ArtistController::class, 'store'])->name('artists.store');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::post('/musics', [MusicController::class, 'store'])->name('musics.store');
    });

    Route::post('/playlist-tracks', [PlaylistTrackController::class, 'store'])->name('playlist-tracks.store');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ADDED: withoutMiddleware()
    Route::get('/health', fn () => response()->json(['ok' => true]))
        ->name('health')
        ->withoutMiddleware(['auth']);
});
