<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Music;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtistController extends Controller
{
    public function index()
    {
        $q = trim((string) request('q', ''));
        $artists = Artist::query()
            ->withCount('musics')
            ->when($q !== '', function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
            })
            ->orderBy('name')
            ->get();
        $popularArtists = Artist::query()
            ->where('is_popular', true)
            ->orderBy('name')
            ->take(30)
            ->get();
        $sidebarArtists = Artist::whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::whereHas('musics')->count() > 20;

        return view('app.artists.index', compact('artists', 'popularArtists', 'sidebarArtists', 'hasMore', 'q'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:artists,name'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('artist-photos', 'public');
        }
        unset($validated['photo']);

        Artist::create($validated);

        return back()->with('status', 'Artist created.');
    }

    public function edit(Artist $artist)
    {
        $sidebarArtists = Artist::whereHas('musics')->orderBy('name')->take(20)->get();
        $hasMore = Artist::whereHas('musics')->count() > 20;

        return view('app.artists.edit', compact('artist', 'sidebarArtists', 'hasMore'));
    }

    public function update(Request $request, Artist $artist)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:artists,name,' . $artist->id],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('photo')) {
            if (!empty($artist->photo_path)) {
                Storage::disk('public')->delete($artist->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('artist-photos', 'public');
        }
        unset($validated['photo']);

        $artist->update($validated);

        return redirect()->route('create')->with('status', 'Artist updated.');
    }

    public function destroy(Artist $artist)
    {
        if (!empty($artist->photo_path)) {
            Storage::disk('public')->delete($artist->photo_path);
        }

        Music::query()
            ->where('artist_id', $artist->id)
            ->update(['artist_id' => null]);

        $artist->delete();

        return back()->with('status', 'Artist deleted.');
    }

    public function markPopular(Artist $artist)
    {
        $artist->is_popular = true;
        $artist->save();

        return back()->with('status', 'Artist added to Popular.');
    }

    public function unmarkPopular(Artist $artist)
    {
        $artist->is_popular = false;
        $artist->save();

        return back()->with('status', 'Artist removed from Popular.');
    }
}
