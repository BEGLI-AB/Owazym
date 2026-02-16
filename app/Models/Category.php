<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    public function musics(): HasMany
    {
        return $this->hasMany(Music::class, 'category_id');
    }
}
