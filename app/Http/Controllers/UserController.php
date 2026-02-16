<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Category;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $randomLimit = 15;
        $user = Auth::user();
        $firstName = 'Guest';
        $plan = 'free';

        if ($user) {
            $firstName = $user->name;
            $plan = $user->subscribes ? 'premium' : 'free';
        }

        $selectedArtistId = (int) $request->query('artist_id', 0);
        $selectedMusicId = (int) $request->query('music_id', 0);
        $selectedArtist = $selectedArtistId > 0 ? Artist::find($selectedArtistId) : null;

        $musicsQuery = Music::with(['artists', 'year']);
        if ($selectedArtistId > 0) {
            $musicsQuery->whereHas('artists', function ($q) use ($selectedArtistId) {
                $q->where('artists.id', $selectedArtistId);
            });
        }

        $musics = $musicsQuery->inRandomOrder()->take($randomLimit)->get();
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
        $artistsQuery = Artist::whereHas('musics');
        $artists = (clone $artistsQuery)->inRandomOrder()->take($randomLimit)->get();
        $hasMore = (clone $artistsQuery)->count() > $randomLimit;

        $popularArtists = Artist::whereHas('musics')
            ->inRandomOrder()
            ->take($randomLimit)
            ->get();

        $newMusics = Music::with(['artists', 'year'])
            ->inRandomOrder()
            ->take($randomLimit)
            ->get();

        $popularGenres = Category::withCount('musics')
            ->whereHas('musics')
            ->orderByDesc('musics_count')
            ->take(3)
            ->get();

        $genreMusics = Music::with(['artists', 'year'])
            ->whereIn('category_id', $popularGenres->pluck('id'))
            ->latest()
            ->get()
            ->groupBy('category_id');

        return view('home', [
            'loggedIn' => true,
            'firstName' => $firstName,
            'plan'     => $plan,
            'musics'   => $musics,
            'albumMusics' => $albumMusics,
            'featuredMusic' => $featuredMusic,
            'artists'  => $artists,
            'hasMore'  => $hasMore,
            'selectedArtistId' => $selectedArtistId,
            'selectedArtist' => $selectedArtist,
            'selectedMusicId' => $selectedMusicId,
            'popularArtists' => $popularArtists,
            'newMusics' => $newMusics,
            'popularGenres' => $popularGenres,
            'genreMusics' => $genreMusics,
        ]);
    }
}
