<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    protected $fillable = ['name', 'user_id'];

    public function music(): BelongsToMany
    {
        return $this->belongsToMany(
            Music::class,
            'playlist_tracks',
            'playlist_id',
            'music_id'
        );
    }
}
