<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use Illuminate\Http\Request;

class ArtistController extends Controller
{
    public function index()
    {
        $artists = Artist::orderBy('name')->get();
        $sidebarArtists = Artist::whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::whereHas('musics')->count() > 20;

        return view('app.artists.index', compact('artists', 'sidebarArtists', 'hasMore'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:artists,name'],
        ]);

        Artist::create($validated);

        return back()->with('status', 'Artist created.');
    }
}
