<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Music;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = User::first();

        $selectedArtistId = (int) $request->query('artist_id', 0);
        $selectedMusicId = (int) $request->query('music_id', 0);

        $musicsQuery = Music::with(['artists', 'year']);
        if ($selectedArtistId > 0) {
            $musicsQuery->whereHas('artists', function ($q) use ($selectedArtistId) {
                $q->where('artists.id', $selectedArtistId);
            });
        }

        $musics = $musicsQuery->latest()->get();
        $featuredMusic = $musics->firstWhere('id', $selectedMusicId) ?? $musics->first();

        $albumMusics = collect();
        if ($featuredMusic) {
            $featuredArtistIds = $featuredMusic->artists->pluck('id');
            $albumMusics = $musics
                ->filter(function ($music) use ($featuredArtistIds) {
                    return $music->artists->pluck('id')->intersect($featuredArtistIds)->isNotEmpty();
                })
                ->values();
        }
        $artistsQuery = Artist::whereHas('musics')->orderBy('name');
        $artists = $artistsQuery->take(20)->get();
        $hasMore = (clone $artistsQuery)->count() > 20;

        return view('home', [
            'loggedIn' => true,
            'firstName' => $user->name ?? 'Guest',
            'plan'     => ($user && $user->subscribes) ? 'premium' : 'free',
            'musics'   => $musics,
            'albumMusics' => $albumMusics,
            'featuredMusic' => $featuredMusic,
            'artists'  => $artists,
            'hasMore'  => $hasMore,
            'selectedArtistId' => $selectedArtistId,
            'selectedMusicId' => $selectedMusicId,
        ]);
    }
}

