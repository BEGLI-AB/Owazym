<?php

namespace Database\Seeders;

use App\Models\Playlist_track;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class Playlist_Trakc_Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Playlist_track::create([
        "playlist_id"=>1,
        "music_id"=>1,
        ]);
    }
}
