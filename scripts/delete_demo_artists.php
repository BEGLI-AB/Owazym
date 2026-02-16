<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$names = [
    'Myrat Molla',
    'Amalia Zehin',
    'Jeren Halnazarowa',
    'Aman Ahmet',
    'Resool',
    'Didar Nurberdiyew',
    'Natavan Habibi',
    'Selbi Tuwakgylyjowa',
    'Mekan Atayev',
    'S Beater',
];

$artists = App\Models\Artist::whereIn('name', $names)->get();
$artistIds = $artists->pluck('id');

DB::table('music_artist')->whereIn('artist_id', $artistIds)->delete();
App\Models\Music::whereIn('artist_id', $artistIds)->delete();
App\Models\Artist::whereIn('id', $artistIds)->delete();

echo 'Deleted artists: ' . $artistIds->count() . PHP_EOL;

