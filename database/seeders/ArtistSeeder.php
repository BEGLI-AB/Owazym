<?php

namespace Database\Seeders;

use App\Models\Artist;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArtistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Artist::create([
        "name"=>"Jeren Halnazarowa",
        ]);
        Artist::create([
        "name"=>"Mad Nazarow",
        ]);
        Artist::create([
        "name"=>"Musa Halbayew",
        ]);
        Artist::create([
        "name"=>"Selbi Tuwakgylyjowa",
        ]);
        Artist::create([
        "name"=>"Syke Dali",
        ]);
        Artist::create([
        "name"=>"Dali dade",
        ]);
        Artist::create([
        "name"=>"Gulalek Gulmyradowa",
        ]);
        Artist::create([
        "name"=>"S-beater",
        ]);
        Artist::create([
        "name"=>"Amalia",
        ]);
    }
}
