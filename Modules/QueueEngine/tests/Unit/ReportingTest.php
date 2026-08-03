<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Modules\QueueEngine\Http\Controllers\Api\ReportingController;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Ticket;

beforeEach(function () {
    Artisan::call('migrate', [
        '--path' => [
            'database/migrations/tenant',
            'Modules/QueueEngine/database/migrations/tenant',
        ],
        '--realpath' => false,
    ]);

    $this->reporting = app(ReportingController::class);
    $this->branch = Branch::create(['name' => 'Test Branch', 'code' => 'TST-01']);
    $this->serviceType = $this->branch->serviceTypes()->create(['name' => 'Deposits', 'prefix' => 'A']);
    $this->counter = $this->branch->counters()->create(['label' => 'Counter 1']);
    $this->teller = User::factory()->create(['name' => 'Test Teller']);
});

function makeTicket(array $overrides = []): Ticket
{
    $issuedAt = $overrides['issued_at'] ?? now();
    $calledAt = $overrides['called_at'] ?? $issuedAt->copy()->addMinutes(2);
    $servedAt = $overrides['served_at'] ?? $calledAt->copy()->addSeconds(5);
    $completedAt = $overrides['completed_at'] ?? $servedAt->copy()->addMinutes(3);

    return Ticket::create(array_merge([
        'branch_id' => test()->branch->id,
        'service_type_id' => test()->serviceType->id,
        'counter_id' => test()->counter->id,
        'served_by' => test()->teller->id,
        'ticket_number' => 'A'.random_int(100, 999),
        'sequence' => random_int(1, 999),
        'status' => 'done',
        'priority' => 'normal',
        'called_at' => $calledAt,
        'served_at' => $servedAt,
        'completed_at' => $completedAt,
        'created_at' => $issuedAt,
    ], array_diff_key($overrides, array_flip(['issued_at']))));
}

it('computes overview counts, no-show rate, and average wait/service times', function () {
    makeTicket(['status' => 'done', 'called_at' => now(), 'served_at' => now()->addSeconds(5), 'completed_at' => now()->addSeconds(65)]); // 60s service
    makeTicket(['status' => 'done', 'called_at' => now(), 'served_at' => now()->addSeconds(5), 'completed_at' => now()->addSeconds(35)]); // 30s service
    makeTicket(['status' => 'no_show']);

    $response = $this->reporting->overview(Request::create('/?range=today'), $this->branch);
    $data = $response->getData(true);

    expect($data['issued'])->toBe(3);
    expect($data['completed'])->toBe(2);
    expect($data['no_show'])->toBe(1);
    expect($data['no_show_rate'])->toBe(33.3);
    expect($data['avg_service_seconds'])->toBe(45); // (60+30)/2
});

it('groups ticket volume by service type', function () {
    $forex = $this->branch->serviceTypes()->create(['name' => 'Forex', 'prefix' => 'C']);

    makeTicket(['service_type_id' => $this->serviceType->id]);
    makeTicket(['service_type_id' => $this->serviceType->id]);
    makeTicket(['service_type_id' => $forex->id]);

    $response = $this->reporting->serviceTypeVolume(Request::create('/?range=today'), $this->branch);
    $data = collect($response->getData(true))->keyBy('service_type');

    expect($data['Deposits']['ticket_count'])->toBe(2);
    expect($data['Forex']['ticket_count'])->toBe(1);
});

it('attributes throughput to the teller who served each ticket', function () {
    $otherTeller = User::factory()->create(['name' => 'Other Teller']);

    makeTicket(['served_by' => $this->teller->id, 'status' => 'done']);
    makeTicket(['served_by' => $this->teller->id, 'status' => 'done']);
    makeTicket(['served_by' => $otherTeller->id, 'status' => 'done']);
    makeTicket(['served_by' => $otherTeller->id, 'status' => 'no_show']); // excluded — not completed

    $response = $this->reporting->tellerThroughput(Request::create('/?range=today'), $this->branch);
    $data = collect($response->getData(true))->keyBy('teller');

    expect($data['Test Teller']['tickets_served'])->toBe(2);
    expect($data['Other Teller']['tickets_served'])->toBe(1);
});
