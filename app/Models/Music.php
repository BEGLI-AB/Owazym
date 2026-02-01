<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    public function playlists()
    {
        return $this->belongsToMany(Playlist::class);
    }
}
