<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Playlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class PlaylistController extends Controller
{
    public function index(Request $request): View
    {
        $userId = Auth::id();
        $requestedPlaylistId = (int) $request->query('playlist_id', 0);

        $playlists = Playlist::query()
            ->where('user_id', $userId)
            ->orderBy('created_at')
            ->get();

        $playlist = $playlists->firstWhere('id', $requestedPlaylistId) ?? $playlists->first();
        $tracks = collect();
        if ($playlist) {
            $playlist->load(['music.artists', 'music.year', 'music.category']);
            $playlist->setRelation('music', $playlist->music->unique('id')->values());
            $tracks = $playlist->music;
        }

        $sidebarArtists = Artist::query()->whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::query()->whereHas('musics')->count() > 20;

        return view('app.playlist.index', [
            'playlist' => $playlist,
            'playlists' => $playlists,
            'tracks' => $tracks,
            'artists' => $sidebarArtists,
            'hasMore' => $hasMore,
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'regex:/\S/'],
        ]);

        $playlist = Playlist::firstOrCreate(
            [
                'user_id' => Auth::id(),
                'name' => trim((string) $validated['name']),
            ]
        );

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'playlist' => [
                    'id' => $playlist->id,
                    'name' => $playlist->name,
                ],
                'created' => $playlist->wasRecentlyCreated,
            ]);
        }

        return redirect()
            ->route('playlist.index', ['playlist_id' => $playlist->id])
            ->with('status', $playlist->wasRecentlyCreated ? __('app.playlist_created') : __('app.playlist_exists'));
    }

    public function destroy(Playlist $playlist, Request $request): RedirectResponse|JsonResponse|Response
    {
        abort_unless((int) $playlist->user_id === (int) Auth::id(), 403);

        $playlist->music()->detach();
        $playlist->delete();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect()
            ->route('playlist.index')
            ->with('status', __('app.playlist_deleted'));
    }
}
