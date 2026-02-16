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
        Year::create([
        "date"=>2015,
        ]);
        Year::create([
        "date"=>2014,
        ]);
        Year::create([
        "date"=>2013   ,
        ]);
        Year::create([
        "date"=>2012,
        ]);
        Year::create([
        "date"=>2011   ,
        ]);
        Year::create([
        "date"=>2010,
        ]);
        Year::create([
        "date"=>2009,
        ]);
        Year::create([
        "date"=>2008,
        ]);
        Year::create([
        "date"=>2007,
        ]);
    }
}
