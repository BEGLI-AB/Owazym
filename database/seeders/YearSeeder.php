<?php

namespace Database\Seeders;

use App\Models\Year;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class YearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Year::create([
        "date"=>2026,
        ]);
        Year::create([
        "date"=>2025,
        ]);
        Year::create([
        "date"=>2024,
        ]);
        Year::create([
        "date"=>2023,
        ]);
        Year::create([
        "date"=>2022,
        ]);
        Year::create([
        "date"=>2021,
        ]);
        Year::create([
        "date"=>2020,
        ]);
        Year::create([
        "date"=>2019,
        ]);
        Year::create([
        "date"=>2018,
        ]);
        Year::create([
        "date"=>2017,
        ]);
        Year::create([
        "date"=>2016,
        ]);
    }
}
