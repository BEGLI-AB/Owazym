<?php

namespace App\Http\Controllers;

use App\Models\Music;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
public function index()
{
    $user = User::first();

    $musics = Music::with('artist')->get();

    return view('home', [
        'loggedIn'  => true,
        'firstName'=> $user->name ?? 'Guest',
        'plan'     => ($user && $user->subscribes) ? 'premium' : 'free',
        'musics'   => $musics,
    ]);
}
    
}