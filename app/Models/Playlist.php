<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    public function tracks()
    {
        return $this->belongsToMany(Music::class);
    }
}
