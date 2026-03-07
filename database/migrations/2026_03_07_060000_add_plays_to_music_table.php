<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('music', function (Blueprint $table) {
            if (!Schema::hasColumn('music', 'plays')) {
                $table->unsignedBigInteger('plays')->default(0)->after('category_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('music', function (Blueprint $table) {
            if (Schema::hasColumn('music', 'plays')) {
                $table->dropColumn('plays');
            }
        });
    }
};
