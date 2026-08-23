<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddCountries extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            ['name' => 'Belgium', 'code' => 'BE', 'code3' => 'BEL', 'phone_code' => '+32'],
            ['name' => 'Netherlands', 'code' => 'NL', 'code3' => 'NLD', 'phone_code' => '+31'],
            ['name' => 'France', 'code' => 'FR', 'code3' => 'FRA', 'phone_code' => '+33'],
            ['name' => 'Germany', 'code' => 'DE', 'code3' => 'DEU', 'phone_code' => '+49'],
            ['name' => 'United Kingdom', 'code' => 'GB', 'code3' => 'GBR', 'phone_code' => '+44'],
            ['name' => 'United States', 'code' => 'US', 'code3' => 'USA', 'phone_code' => '+1'],
            ['name' => 'Canada', 'code' => 'CA', 'code3' => 'CAN', 'phone_code' => '+1'],
            ['name' => 'Spain', 'code' => 'ES', 'code3' => 'ESP', 'phone_code' => '+34'],
            ['name' => 'Italy', 'code' => 'IT', 'code3' => 'ITA', 'phone_code' => '+39'],
            ['name' => 'Switzerland', 'code' => 'CH', 'code3' => 'CHE', 'phone_code' => '+41'],
            ['name' => 'Austria', 'code' => 'AT', 'code3' => 'AUT', 'phone_code' => '+43'],
            ['name' => 'Luxembourg', 'code' => 'LU', 'code3' => 'LUX', 'phone_code' => '+352'],
            ['name' => 'Denmark', 'code' => 'DK', 'code3' => 'DNK', 'phone_code' => '+45'],
            ['name' => 'Sweden', 'code' => 'SE', 'code3' => 'SWE', 'phone_code' => '+46'],
            ['name' => 'Norway', 'code' => 'NO', 'code3' => 'NOR', 'phone_code' => '+47'],
            ['name' => 'Finland', 'code' => 'FI', 'code3' => 'FIN', 'phone_code' => '+358'],
            ['name' => 'Poland', 'code' => 'PL', 'code3' => 'POL', 'phone_code' => '+48'],
            ['name' => 'Portugal', 'code' => 'PT', 'code3' => 'PRT', 'phone_code' => '+351'],
            ['name' => 'Ireland', 'code' => 'IE', 'code3' => 'IRL', 'phone_code' => '+353'],
            ['name' => 'Greece', 'code' => 'GR', 'code3' => 'GRC', 'phone_code' => '+30'],
        ];

        foreach ($countries as $country) {
            Country::firstOrCreate(
                ['code' => $country['code']],
                $country
            );
        }
    }
}
