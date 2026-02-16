<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            DELETE pt1 FROM playlist_tracks pt1
            INNER JOIN playlist_tracks pt2
                ON pt1.playlist_id = pt2.playlist_id
                AND pt1.music_id = pt2.music_id
                AND pt1.id > pt2.id
        ');

        Schema::table('playlist_tracks', function (Blueprint $table) {
            $table->unique(['playlist_id', 'music_id'], 'playlist_tracks_playlist_music_unique');
        });
    }

    public function down(): void
    {
        Schema::table('playlist_tracks', function (Blueprint $table) {
            $table->dropUnique('playlist_tracks_playlist_music_unique');
        });
    }
};

