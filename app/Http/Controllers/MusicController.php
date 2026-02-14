<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Music;
use App\Models\Artist;
use App\Models\Year;
use App\Models\Language;
use App\Models\Category;

class MusicController extends Controller
{

    public function index()
    {
        $musics = Music::with(['artists', 'year', 'language', 'category'])->get();
        $artists = Artist::whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::whereHas('musics')->count() > 20;

        return view('app.music.index', compact('musics', 'artists', 'hasMore'));
    }

    public function create()
    {
        $artists = Artist::orderBy('name')->get();
        $sidebarArtists = Artist::take(20)->get();
        $hasMore = Artist::count() > 20;
        $years = Year::orderBy('date')->get();
        $languages = Language::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();

        return view('app.create', compact('artists', 'sidebarArtists', 'hasMore', 'years', 'languages', 'categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'artist_ids' => ['required', 'array', 'min:1'],
            'artist_ids.*' => ['integer', 'exists:artists,id'],
            'year_id' => ['required', 'exists:years,id'],
            'language_id' => ['required', 'exists:languages,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'audio' => ['required', 'file', 'mimes:mp3,wav,ogg,flac,m4a'],
            'cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'dimensions:width=3000,height=3000'],
        ]);

        $artistIds = $validated['artist_ids'];
        unset($validated['artist_ids']);
        $validated['artist_id'] = $artistIds[0] ?? null;

        if ($request->hasFile('audio')) {
            $validated['audio_path'] = $request->file('audio')->store('audios', 'public');
        }
        if ($request->hasFile('cover')) {
            $validated['cover_path'] = $request->file('cover')->store('covers', 'public');
        }

        $music = Music::create($validated);
        $music->artists()->sync($artistIds);

        return back()->with('status', 'Music created.');
    }
}
