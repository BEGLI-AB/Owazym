<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Category;
use App\Models\Language;
use App\Models\Music;
use App\Models\Playlist;
use App\Models\Year;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function albumData(Request $request)
    {
        $selectedArtistId = (int) $request->query('artist_id', 0);
        $selectedMusicId = (int) $request->query('music_id', 0);
        $selectedMusic = null;
        if ($selectedMusicId > 0) {
            $selectedMusic = Music::with(['artists', 'year'])->find($selectedMusicId);
        }
        if ($selectedArtistId <= 0 && $selectedMusic) {
            $selectedArtistId = (int) ($selectedMusic->artists->first()?->id ?? 0);
        }
        $selectedArtist = $selectedArtistId > 0 ? Artist::find($selectedArtistId) : null;

        if ($selectedArtistId > 0) {
            $albumMusics = Music::with(['artists', 'year'])
                ->whereHas('artists', function ($q) use ($selectedArtistId) {
                    $q->where('artists.id', $selectedArtistId);
                })
                ->latest('id')
                ->take(12)
                ->get();
        } else {
            $albumMusics = Music::with(['artists', 'year'])
                ->inRandomOrder()
                ->take(12)
                ->get();
        }

        $featuredMusic = $albumMusics->firstWhere('id', $selectedMusicId) ?? $selectedMusic ?? $albumMusics->first();

        $artistCover = $selectedArtist?->photo_path ? asset('storage/'.$selectedArtist->photo_path) : null;
        $featuredCover = $artistCover ?? $featuredMusic?->cover_url ?? asset('/img/1.jpg');

        return response()->json([
            'featured' => $featuredMusic ? [
                'id' => $featuredMusic->id,
                'title' => $featuredMusic->name,
                'artist' => $featuredMusic->artists->pluck('name')->join(', '),
                'audio_url' => $featuredMusic->audio_path ? asset('storage/'.$featuredMusic->audio_path) : '',
                'cover_url' => $featuredMusic->cover_url,
                'hero_cover_url' => $featuredCover,
                'year' => $featuredMusic->year?->date,
            ] : null,
            'tracks' => $albumMusics->map(function (Music $music) {
                return [
                    'id' => $music->id,
                    'title' => $music->name,
                    'artist' => $music->artists->pluck('name')->join(', '),
                    'audio_url' => $music->audio_path ? asset('storage/'.$music->audio_path) : '',
                    'cover_url' => $music->cover_url,
                ];
            })->values(),
            'lock_album_cover' => $selectedArtistId > 0,
            'artist_id' => $selectedArtistId,
            'music_id' => $selectedMusicId,
        ]);
    }

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
        $selectedMusic = null;
        if ($selectedMusicId > 0) {
            $selectedMusic = Music::with(['artists', 'year'])->find($selectedMusicId);
        }
        if ($selectedArtistId <= 0 && $selectedMusic) {
            $selectedArtistId = (int) ($selectedMusic->artists->first()?->id ?? 0);
        }
        $selectedArtist = $selectedArtistId > 0 ? Artist::find($selectedArtistId) : null;

        $musicsQuery = Music::with(['artists', 'year']);
        if ($selectedArtistId > 0) {
            $musicsQuery->whereHas('artists', function ($q) use ($selectedArtistId) {
                $q->where('artists.id', $selectedArtistId);
            });
        }

        $musics = $musicsQuery->inRandomOrder()->take($randomLimit)->get();
        $featuredMusic = $musics->firstWhere('id', $selectedMusicId) ?? $selectedMusic ?? $musics->first();

        $albumMusics = collect();
        if ($selectedArtistId > 0) {
            $albumMusics = Music::with(['artists', 'year'])
                ->whereHas('artists', function ($q) use ($selectedArtistId) {
                    $q->where('artists.id', $selectedArtistId);
                })
                ->latest('id')
                ->take(12)
                ->get();
        } elseif ($featuredMusic) {
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

        $playlists = Playlist::query()
            ->where('user_id', Auth::id())
            ->orderBy('created_at')
            ->get(['id', 'name']);
        $playlist = Playlist::query()
            ->where('user_id', Auth::id())
            ->orderBy('created_at')
            ->first();
        $tracks = collect();
        if ($playlist) {
            $playlist->load(['music.artists', 'music.year', 'music.category']);
            $playlist->setRelation('music', $playlist->music->unique('id')->values());
            $tracks = $playlist->music;
        }

        return view('app', [
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
            'playlists' => $playlists,
            'playlist' => $playlist,
            'tracks' => $tracks,
        ]);
    }

    public function search(Request $request)
    {
        // ADDED: simplePaginate()
        $randomLimit = 60;
        $query = trim((string) $request->query('q', ''));
        $genreId = (int) $request->query('genre_id', 0);
        $countryId = (int) $request->query('country_id', 0);
        $yearId = (int) $request->query('year_id', 0);

        $musicsQuery = Music::with(['artists', 'year']);
        if ($query !== '') {
            $musicsQuery->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhereHas('artists', function ($artistQuery) use ($query) {
                        $artistQuery->where('name', 'like', "%{$query}%");
                    });
            });
        }

        if ($genreId > 0) {
            $musicsQuery->where('category_id', $genreId);
        }

        if ($countryId > 0) {
            $musicsQuery->where('language_id', $countryId);
        }

        if ($yearId > 0) {
            $musicsQuery->where('year_id', $yearId);
        }

        $genres = Category::orderBy('name')->get(['id', 'name']);
        $countries = Language::orderBy('name')->get(['id', 'name']);
        // ADDED: latest()
        $years = Year::latest('date')->get(['id', 'date']);

        $musics = $musicsQuery
            ->inRandomOrder()
            ->simplePaginate($randomLimit)
            ->withQueryString();
        $featuredCover = $musics->getCollection()->first()?->cover_url ?? asset('/img/1.jpg');
        $playlists = Playlist::query()
            ->where('user_id', Auth::id())
            ->orderBy('created_at')
            ->get(['id', 'name']);
        $playlist = Playlist::query()
            ->where('user_id', Auth::id())
            ->orderBy('created_at')
            ->first();
        $tracks = collect();
        if ($playlist) {
            $playlist->load(['music.artists', 'music.year', 'music.category']);
            $playlist->setRelation('music', $playlist->music->unique('id')->values());
            $tracks = $playlist->music;
        }

        return view('app', [
            'musics' => $musics,
            'featuredCover' => $featuredCover,
            'genres' => $genres,
            'countries' => $countries,
            'years' => $years,
            'playlists' => $playlists,
            'playlist' => $playlist,
            'tracks' => $tracks,
        ]);
    }
}
