<?php

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Music;

class PlaylistTrackController extends Controller
{
    public function add(Playlist $playlist, Music $music)
    {
        $playlist->musics()->syncWithoutDetaching([$music->id]);

        return back();
    }

    public function remove(Playlist $playlist, Music $music)
    {
        $playlist->musics()->detach($music->id);

        return back();
    }
}

