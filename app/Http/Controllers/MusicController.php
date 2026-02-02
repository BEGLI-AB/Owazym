<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Music;

class MusicController extends Controller
{

    public function index()
    {
        $musics = Music::with(['artist', 'year', 'language', 'category'])->get();
        return view('app.music.index', compact('musics'));
    }
}
