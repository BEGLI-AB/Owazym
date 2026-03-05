<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaylistTrackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'music_id' => ['required', 'integer', 'exists:music,id'],
            'playlist_id' => ['required', 'integer', 'exists:playlists,id'],
        ]);

        $userId = Auth::id();
        $playlistId = (int) $validated['playlist_id'];
        $playlist = Playlist::query()
            ->where('id', $playlistId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $musicId = (int) $validated['music_id'];
        $syncResult = $playlist->music()->syncWithoutDetaching([$musicId]);
        $added = in_array($musicId, $syncResult['attached'] ?? [], true);

        return response()->json([
            'ok' => true,
            'added' => $added,
            'playlist_id' => $playlist->id,
            'playlist_name' => $playlist->name,
            'music_id' => $musicId,
        ]);
    }

    public function destroy(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'music_id' => ['required', 'integer', 'exists:music,id'],
            'playlist_id' => ['required', 'integer'],
        ]);

        $playlist = Playlist::query()
            ->where('id', (int) $validated['playlist_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $removed = $playlist->music()->detach((int) $validated['music_id']) > 0;

        if ($request->expectsJson()) {
            return response()->json([
                'ok' => true,
                'removed' => $removed,
                'playlist_id' => $playlist->id,
                'music_id' => (int) $validated['music_id'],
            ]);
        }

        return redirect()
            ->route('playlist.index', ['playlist_id' => $playlist->id])
            ->with('status', $removed ? __('app.track_removed_from_playlist') : __('app.track_not_in_playlist'));
    }
}
