<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingProvider;

class ShippingProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $providers = [
            [
                'name' => 'Kerry Express',
                'code' => 'kerry',
                'base_fee' => 50.00,
                'estimated_days' => 3,
                'description' => 'บริการจัดส่งด่วนพิเศษ ครอบคลุมทั่วประเทศ',
                'logo_url' => null,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'J&T Express',
                'code' => 'jnt',
                'base_fee' => 35.00,
                'estimated_days' => 4,
                'description' => 'บริการจัดส่งราคาประหยัด คุ้มค่า',
                'logo_url' => null,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Flash Express',
                'code' => 'flash',
                'base_fee' => 45.00,
                'estimated_days' => 3,
                'description' => 'บริการจัดส่งรวดเร็ว ติดตามง่าย',
                'logo_url' => null,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Thailand Post (EMS)',
                'code' => 'thailand_post_ems',
                'base_fee' => 40.00,
                'estimated_days' => 5,
                'description' => 'บริการจัดส่งไปรษณีย์ไทยแบบ EMS',
                'logo_url' => null,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Best Express',
                'code' => 'best',
                'base_fee' => 42.00,
                'estimated_days' => 4,
                'description' => 'บริการจัดส่งด่วน ปลอดภัย',
                'logo_url' => null,
                'is_active' => false,
                'sort_order' => 5,
            ],
        ];

        foreach ($providers as $provider) {
            ShippingProvider::create($provider);
        }
    }
}
