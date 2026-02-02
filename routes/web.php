<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [UserController::class,'index']);
// Route::post('/playlists/{playlist}/music/{music}', [PlaylistTrackController::class, 'add']);
// Route::delete('/playlists/{playlist}/music/{music}', [PlaylistTrackController::class, 'remove']);