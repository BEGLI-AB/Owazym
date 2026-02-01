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
        "Date"=>2026,
        ]);
        Year::create([
        "Date"=>2025,
        ]);
        Year::create([
        "Date"=>2024,
        ]);
        Year::create([
        "Date"=>2023,
        ]);
        Year::create([
        "Date"=>2022,
        ]);
        Year::create([
        "Date"=>2021,
        ]);
        Year::create([
        "Date"=>2020,
        ]);
        Year::create([
        "Date"=>2019,
        ]);
        Year::create([
        "Date"=>2018,
        ]);
        Year::create([
        "Date"=>2017,
        ]);
        Year::create([
        "Date"=>2016,
        ]);
    }
}
