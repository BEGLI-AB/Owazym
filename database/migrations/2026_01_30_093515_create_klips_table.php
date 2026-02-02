<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('klips', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->foreignId("artist_id");
            $table->foreignId("year_id");
            $table->foreignId("language_id");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klips');
    }
};
