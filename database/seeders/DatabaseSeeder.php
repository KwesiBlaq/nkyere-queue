<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\QueueEngine\Models\Branch;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seeds one demo branch per tenant — enough to open a kiosk, teller
     * console, and signage display against a freshly onboarded bank.
     */
    public function run(): void
    {
        $branch = Branch::create([
            'name' => 'Nkyere Demo Branch',
            'code' => 'DEMO-01',
            'timezone' => 'UTC',
        ]);

        $serviceTypes = collect([
            ['name' => 'Deposits & Withdrawals', 'prefix' => 'A'],
            ['name' => 'Loan Inquiries', 'prefix' => 'B'],
            ['name' => 'Forex & Remittance', 'prefix' => 'C'],
        ])->map(fn (array $type) => $branch->serviceTypes()->create($type));

        collect(['Counter 1', 'Counter 2', 'Counter 3'])
            ->each(fn (string $label) => $branch->counters()->create(['label' => $label]));

        collect([
            ['title' => 'Welcome to Nkyere Demo Branch', 'body' => "It won't be long — you'll be called by ticket number and counter.", 'sort_order' => 1],
            ['title' => 'Fixed Deposit Accounts', 'body' => 'Earn up to 8.5% APY on 12-month fixed deposits. Ask a teller for details.', 'sort_order' => 2],
            ['title' => 'Mobile Banking', 'body' => 'Skip the branch next time — manage transfers and bill pay from our app.', 'sort_order' => 3],
        ])->each(fn (array $promo) => $branch->promoContent()->create($promo));

        foreach (['branch_admin', 'teller'] as $role) {
            Role::findOrCreate($role);
        }

        $teller = User::factory()->create([
            'name' => 'Demo Teller',
            'email' => 'teller@nkyere.test',
            'password' => bcrypt('password'),
        ]);
        $teller->assignRole('teller');
    }
}
