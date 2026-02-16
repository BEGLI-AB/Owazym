<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Playlist;
use Illuminate\Support\Facades\Auth;

class PlaylistController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $playlist = Playlist::query()
            ->where('user_id', $userId)
            ->where('name', 'Favorite Music')
            ->first();

        if (! $playlist) {
            $playlist = Playlist::create([
                'user_id' => $userId,
                'name' => 'Favorite Music',
            ]);
        }

        $playlist->load(['music.artists', 'music.year', 'music.category']);
        $playlist->setRelation('music', $playlist->music->unique('id')->values());

        $sidebarArtists = Artist::query()->whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::query()->whereHas('musics')->count() > 20;

        return view('app.playlist.index', [
            'playlist' => $playlist,
            'tracks' => $playlist->music,
            'artists' => $sidebarArtists,
            'hasMore' => $hasMore,
        ]);
    }
}
