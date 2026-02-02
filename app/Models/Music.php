<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Music extends Model
{

    protected $fillable = [
        'name',
        'artist_id',
        'year_id',
        'language_id',
        'category_id',
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
}
