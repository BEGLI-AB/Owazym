<?php

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [UserController::class, 'index']);

Route::get('/locale/{locale}', [HomeController::class, 'locale'])
    ->name('locale')
    ->where('locale', '[a-z]+');

Route::get('/create', [MusicController::class, 'create'])->name('create');

Route::get('/artists', [ArtistController::class, 'index'])->name('artists.index');
Route::get('/musics', [MusicController::class, 'index'])->name('musics.index');

Route::post('/artists', [ArtistController::class, 'store'])->name('artists.store');
Route::post('/musics', [MusicController::class, 'store'])->name('musics.store');
// Route::post('/playlists/{playlist}/music/{music}', [PlaylistTrackController::class, 'add']);
// Route::delete('/playlists/{playlist}/music/{music}', [PlaylistTrackController::class, 'remove']);
