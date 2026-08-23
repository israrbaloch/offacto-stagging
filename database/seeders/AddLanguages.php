<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddLanguages extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            [
                'name' => 'English',
                'code' => 'en',
                'native_name' => 'English',
            ],
            [
                'name' => 'French',
                'code' => 'fr',
                'native_name' => 'Français',
            ],
            [
                'name' => 'Dutch',
                'code' => 'nl',
                'native_name' => 'Nederlands',
            ],
        ];

        foreach ($languages as $language) {
            Language::firstOrCreate(
                ['code' => $language['code']],
                $language
            );
        }
    }
}
