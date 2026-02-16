<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany as BelongsToManyRelation;

class Music extends Model
{

    protected $fillable = [
        'name',
        'artist_id',
        'year_id',
        'language_id',
        'category_id',
        'audio_path',
        'cover_path',
    ];

    protected $appends = [
        'cover_url',
    ];
    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(
            Playlist::class,
            'playlist_tracks',
            'music_id',
            'playlist_id',
        );
    }
    public function artist(): BelongsTo
    {
        return $this->belongsTo(
            Artist::class,
        );
    }

    public function artists(): BelongsToManyRelation
    {
        return $this->belongsToMany(
            Artist::class,
            'music_artist',
            'music_id',
            'artist_id',
        );
    }

    public function year(): BelongsTo
    {
        return $this->belongsTo(
            Year::class,
        );
    }

    public function language(): BelongsTo
    {
        return $this->belongsTo(
            Language::class,
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
        );
    }

    public function getCoverUrlAttribute(): string
    {
        if (!empty($this->cover_path)) {
            return asset('storage/' . $this->cover_path);
        }

        $palettes = [
            ['#0f172a', '#1e293b'],
            ['#064e3b', '#065f46'],
            ['#3b0764', '#581c87'],
            ['#3f1d0a', '#7c2d12'],
            ['#172554', '#1d4ed8'],
            ['#4c0519', '#be123c'],
        ];
        $id = (int) ($this->id ?? 0);
        $pair = $palettes[$id % count($palettes)];
        $title = htmlspecialchars((string) ($this->name ?? 'Track'), ENT_QUOTES, 'UTF-8');

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">'
            . '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            . '<stop offset="0%" stop-color="' . $pair[0] . '"/><stop offset="100%" stop-color="' . $pair[1] . '"/>'
            . '</linearGradient></defs>'
            . '<rect width="1000" height="1000" fill="url(#g)"/>'
            . '<circle cx="500" cy="500" r="250" fill="rgba(255,255,255,0.15)"/>'
            . '<text x="500" y="540" text-anchor="middle" fill="#ffffff" font-size="110" font-family="Arial, sans-serif">OWAZYM</text>'
            . '<text x="500" y="640" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="44" font-family="Arial, sans-serif">'
            . $title
            . '</text>'
            . '</svg>';

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
}

