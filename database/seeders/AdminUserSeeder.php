<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('name', 'admin')->first();

        if ($admin) {
            $admin->subscribes = true;
            $admin->password = Hash::make('Modalive123');
            $admin->save();
        } else {
            User::create([
                'name' => 'admin',
                'subscribes' => true,
                'password' => Hash::make('Modalive123'),
            ]);
        }
    }
}
