<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Music;
use App\Models\Artist;
use App\Models\Year;
use App\Models\Language;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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
        $artistQuery = trim((string) request('artist_q', ''));
        $musicQuery = trim((string) request('music_q', ''));
        $categoryQuery = trim((string) request('category_q', ''));

        $artists = Artist::orderBy('name')->get();
        $sidebarArtists = Artist::take(20)->get();
        $hasMore = Artist::count() > 20;
        $years = Year::orderBy('date')->get();
        $languages = Language::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $existingArtists = Artist::query()
            ->when($artistQuery !== '', function ($q) use ($artistQuery) {
                $q->where('name', 'like', '%' . $artistQuery . '%');
            })
            ->orderByDesc('id')
            ->take(50)
            ->get();
        $existingMusics = Music::with(['artists'])
            ->when($musicQuery !== '', function ($q) use ($musicQuery) {
                $q->where('name', 'like', '%' . $musicQuery . '%');
            })
            ->orderByDesc('id')
            ->take(50)
            ->get();
        $existingCategories = Category::query()
            ->withCount('musics')
            ->when($categoryQuery !== '', function ($q) use ($categoryQuery) {
                $q->where('name', 'like', '%' . $categoryQuery . '%');
            })
            ->orderByDesc('id')
            ->take(50)
            ->get();

        return view('app.create', compact(
            'artists',
            'sidebarArtists',
            'hasMore',
            'years',
            'languages',
            'categories',
            'existingArtists',
            'existingMusics',
            'existingCategories',
            'artistQuery',
            'musicQuery',
            'categoryQuery'
        ));
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
            'audio' => ['required', 'file', 'mimes:mp3,wav,ogg,flac,m4a', 'max:102400'],
            'cover' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $artistIds = $validated['artist_ids'];
        unset($validated['artist_ids']);
        $validated['artist_id'] = $artistIds[0] ?? null;

        if ($request->hasFile('audio')) {
            $validated['audio_path'] = $request->file('audio')->store('audios', 'public');
        }
        if ($request->hasFile('cover')) {
            $validated['cover_path'] = $this->resizeAndStoreCover($request->file('cover'));
        }

        $music = Music::create($validated);
        $music->artists()->sync($artistIds);

        return back()->with('status', 'Music created.');
    }

    public function edit(Music $music)
    {
        $artists = Artist::orderBy('name')->get();
        $sidebarArtists = Artist::take(20)->get();
        $hasMore = Artist::count() > 20;
        $years = Year::orderBy('date')->get();
        $languages = Language::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $music->load('artists');

        return view('app.music.edit', compact(
            'music',
            'artists',
            'sidebarArtists',
            'hasMore',
            'years',
            'languages',
            'categories'
        ));
    }

    public function update(Request $request, Music $music)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'artist_ids' => ['required', 'array', 'min:1'],
            'artist_ids.*' => ['integer', 'exists:artists,id'],
            'year_id' => ['required', 'exists:years,id'],
            'language_id' => ['required', 'exists:languages,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'audio' => ['nullable', 'file', 'mimes:mp3,wav,ogg,flac,m4a', 'max:102400'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $artistIds = $validated['artist_ids'];
        unset($validated['artist_ids']);
        $validated['artist_id'] = $artistIds[0] ?? null;

        if ($request->hasFile('audio')) {
            if (!empty($music->audio_path)) {
                Storage::disk('public')->delete($music->audio_path);
            }
            $validated['audio_path'] = $request->file('audio')->store('audios', 'public');
        }
        if ($request->hasFile('cover')) {
            if (!empty($music->cover_path)) {
                Storage::disk('public')->delete($music->cover_path);
            }
            $validated['cover_path'] = $this->resizeAndStoreCover($request->file('cover'));
        }

        $music->update($validated);
        $music->artists()->sync($artistIds);

        return redirect()->route('create')->with('status', 'Music updated.');
    }

    public function destroy(Music $music)
    {
        if (!empty($music->audio_path)) {
            Storage::disk('public')->delete($music->audio_path);
        }
        if (!empty($music->cover_path)) {
            Storage::disk('public')->delete($music->cover_path);
        }

        $music->artists()->detach();
        DB::table('playlist_tracks')->where('music_id', $music->id)->delete();
        $music->delete();

        return back()->with('status', 'Music deleted.');
    }

    private function resizeAndStoreCover($file): string
    {
        if (!function_exists('imagecreatetruecolor')) {
            return $file->store('covers', 'public');
        }
        $targetSize = 3000;
        $path = $file->getRealPath();
        $info = @getimagesize($path);
        if (!$info || empty($info['mime'])) {
            return $file->store('covers', 'public');
        }

        $mime = $info['mime'];
        switch ($mime) {
            case 'image/png':
                $src = imagecreatefrompng($path);
                $ext = 'png';
                break;
            case 'image/webp':
                $src = imagecreatefromwebp($path);
                $ext = 'webp';
                break;
            default:
                $src = imagecreatefromjpeg($path);
                $ext = 'jpg';
                break;
        }

        if (!$src) {
            return $file->store('covers', 'public');
        }

        $srcW = imagesx($src);
        $srcH = imagesy($src);
        $crop = min($srcW, $srcH);
        $srcX = (int) floor(($srcW - $crop) / 2);
        $srcY = (int) floor(($srcH - $crop) / 2);

        $dst = imagecreatetruecolor($targetSize, $targetSize);
        if ($ext === 'png' || $ext === 'webp') {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
            imagefilledrectangle($dst, 0, 0, $targetSize, $targetSize, $transparent);
        }

        imagecopyresampled(
            $dst,
            $src,
            0,
            0,
            $srcX,
            $srcY,
            $targetSize,
            $targetSize,
            $crop,
            $crop
        );

        $filename = 'covers/' . Str::uuid()->toString() . '.' . $ext;
        ob_start();
        if ($ext === 'png') {
            imagepng($dst);
        } elseif ($ext === 'webp') {
            imagewebp($dst, null, 90);
        } else {
            imagejpeg($dst, null, 90);
        }
        $binary = ob_get_clean();

        imagedestroy($src);
        imagedestroy($dst);

        Storage::disk('public')->put($filename, $binary);
        return $filename;
    }
}
