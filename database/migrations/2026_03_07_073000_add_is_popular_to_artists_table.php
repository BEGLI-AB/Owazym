<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            if (!Schema::hasColumn('artists', 'is_popular')) {
                $table->boolean('is_popular')->default(false)->after('photo_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            if (Schema::hasColumn('artists', 'is_popular')) {
                $table->dropColumn('is_popular');
            }
        });
    }
};
