<?php

namespace Database\Seeders;

use App\Models\Artist;
use App\Models\Category;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory()->create();

        $this->call([
            ArtistSeeder::class,
            LanguageSeeder::class,
            YearSeeder::class,
            CategorySeeder::class,
            PlaylistSeeder::class,
            Playlist_Trakc_Seeder::class,
            MusicSeeder::class,
            UserSeeder::class,
            ]);
    }
}
