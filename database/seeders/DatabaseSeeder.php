<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Ticket;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seeds one demo branch per tenant — enough to open a kiosk, teller
     * console, signage display, and admin dashboard against a freshly
     * onboarded bank, with a week of history so the reports aren't empty.
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

        $counters = collect(['Counter 1', 'Counter 2', 'Counter 3'])
            ->map(fn (string $label) => $branch->counters()->create(['label' => $label]));

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

        $secondTeller = User::factory()->create([
            'name' => 'Ama Mensah',
            'email' => 'ama@nkyere.test',
            'password' => bcrypt('password'),
        ]);
        $secondTeller->assignRole('teller');

        $admin = User::factory()->create([
            'name' => 'Branch Admin',
            'email' => 'admin@nkyere.test',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('branch_admin');

        $this->backfillHistory($branch, $serviceTypes, $counters, [$teller, $secondTeller]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \Modules\QueueEngine\Models\ServiceType>  $serviceTypes
     * @param  \Illuminate\Support\Collection<int, \Modules\QueueEngine\Models\Counter>  $counters
     * @param  array<int, \App\Models\User>  $tellers
     */
    private function backfillHistory($branch, $serviceTypes, $counters, array $tellers): void
    {
        foreach (range(6, 0) as $daysAgo) {
            $day = now()->subDays($daysAgo)->setTime(9, 0);

            foreach ($serviceTypes as $index => $serviceType) {
                $ticketsToday = random_int(4, 9);

                for ($i = 1; $i <= $ticketsToday; $i++) {
                    $issuedAt = $day->copy()->addMinutes(random_int(0, 420));
                    $waitSeconds = random_int(45, 420);
                    $serviceSeconds = random_int(90, 420);
                    $isNoShow = random_int(1, 10) === 1;

                    $calledAt = $issuedAt->copy()->addSeconds($waitSeconds);
                    $counter = $counters[$i % $counters->count()];
                    $tellerForTicket = $tellers[$i % count($tellers)];

                    $ticket = Ticket::create([
                        'branch_id' => $branch->id,
                        'service_type_id' => $serviceType->id,
                        'counter_id' => $counter->id,
                        'served_by' => $tellerForTicket->id,
                        'ticket_number' => $serviceType->prefix.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                        'sequence' => $i,
                        'status' => $isNoShow ? 'no_show' : 'done',
                        'priority' => 'normal',
                        'called_at' => $calledAt,
                        'served_at' => $isNoShow ? null : $calledAt->copy()->addSeconds(10),
                        'completed_at' => $isNoShow ? $calledAt->copy()->addSeconds(30) : $calledAt->copy()->addSeconds(10 + $serviceSeconds),
                        'created_at' => $issuedAt,
                        'updated_at' => $issuedAt,
                    ]);

                    $ticket->events()->create(['event' => 'issued', 'created_at' => $issuedAt]);
                    $ticket->events()->create(['event' => 'called', 'counter_id' => $counter->id, 'created_at' => $calledAt]);

                    if ($isNoShow) {
                        $ticket->events()->create(['event' => 'no_show', 'counter_id' => $counter->id, 'created_at' => $ticket->completed_at]);
                    } else {
                        $ticket->events()->create(['event' => 'serving', 'counter_id' => $counter->id, 'created_at' => $ticket->served_at]);
                        $ticket->events()->create(['event' => 'done', 'counter_id' => $counter->id, 'created_at' => $ticket->completed_at]);
                    }
                }
            }
        }
    }
}
