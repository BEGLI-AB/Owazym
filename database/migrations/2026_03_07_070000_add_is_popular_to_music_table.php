<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('music', function (Blueprint $table) {
            if (!Schema::hasColumn('music', 'is_popular')) {
                $table->boolean('is_popular')->default(false)->after('plays');
            }
        });
    }

    public function down(): void
    {
        Schema::table('music', function (Blueprint $table) {
            if (Schema::hasColumn('music', 'is_popular')) {
                $table->dropColumn('is_popular');
            }
        });
    }
};
