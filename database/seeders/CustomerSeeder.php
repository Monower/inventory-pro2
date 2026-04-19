<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Seed default customer records required by sales flows.
     */
    public function run(): void
    {
        $customer = Customer::query()
            ->where('phone', Customer::WALK_IN_PHONE)
            ->orWhere('email', Customer::WALK_IN_EMAIL)
            ->first();

        $data = [
            'name' => 'Walk-in Customer',
            'email' => Customer::WALK_IN_EMAIL,
            'phone' => Customer::WALK_IN_PHONE,
            'address' => 'N/A',
        ];

        if ($customer) {
            $customer->update($data);

            return;
        }

        Customer::create($data);
    }
}
