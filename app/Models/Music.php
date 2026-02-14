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
}

