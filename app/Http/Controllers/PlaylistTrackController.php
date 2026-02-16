<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaylistTrackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'music_id' => ['required', 'integer', 'exists:music,id'],
        ]);

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

        $musicId = (int) $validated['music_id'];
        $alreadyExists = $playlist->music()
            ->where('music.id', $musicId)
            ->exists();

        if (! $alreadyExists) {
            try {
                $playlist->music()->attach($musicId);
            } catch (QueryException $exception) {
                // Ignore duplicate-key race condition if two requests come at once.
                if ((int) $exception->getCode() !== 23000) {
                    throw $exception;
                }
            }
        }

        return response()->json([
            'ok' => true,
            'added' => ! $alreadyExists,
            'playlist_id' => $playlist->id,
            'music_id' => $musicId,
        ]);
    }
}
