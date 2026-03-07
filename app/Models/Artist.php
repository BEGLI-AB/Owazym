<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Artist extends Model
{
    protected $fillable = ['name', 'photo_path', 'is_popular'];

    public function musics(): BelongsToMany
    {
        return $this->belongsToMany(
            Music::class,
            'music_artist',
            'artist_id',
            'music_id',
        );
    }
}
