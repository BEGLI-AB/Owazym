<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $rows = DB::table('music')
            ->select('id as music_id', 'artist_id')
            ->whereNotNull('artist_id')
            ->get()
            ->map(function ($row) {
                return [
                    'music_id' => $row->music_id,
                    'artist_id' => $row->artist_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })
            ->toArray();

        if (!empty($rows)) {
            DB::table('music_artist')->upsert(
                $rows,
                ['music_id', 'artist_id'],
                ['updated_at']
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // no-op
    }
};
