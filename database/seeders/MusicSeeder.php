<?php

namespace Database\Seeders;

use App\Models\Music;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MusicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Music::create([
        "Name"=>"Seni bilmedim",
        "Artist_id"=>1,
        "Category_id"=>2,
        "Year_id"=>2,
        "Language_id"=>3,
        ]);
    }
}
