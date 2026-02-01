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
        "Name"=>"Jeren Halnazarowa",
        ]);
        Artist::create([
        "Name"=>"Mad Nazarow",
        ]);
        Artist::create([
        "Name"=>"Musa Halbayew",
        ]);
        Artist::create([
        "Name"=>"Selbi Tuwakgylyjowa",
        ]);
        Artist::create([
        "Name"=>"Syke Dali",
        ]);
        Artist::create([
        "Name"=>"Dali dade",
        ]);
        Artist::create([
        "Name"=>"Gulalek Gulmyradowa",
        ]);
        Artist::create([
        "Name"=>"S-beater",
        ]);
        Artist::create([
        "Name"=>"Amalia",
        ]);
    }
}
