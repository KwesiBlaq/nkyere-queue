<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Queue;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Counter;
use Modules\QueueEngine\Models\ServiceType;
use Modules\QueueEngine\Services\TicketService;

beforeEach(function () {
    Artisan::call('migrate', [
        '--path' => [
            'Modules/QueueEngine/database/migrations/tenant',
        ],
        '--realpath' => false,
    ]);

    Queue::fake();

    $this->service = app(TicketService::class);
    $this->branch = Branch::create(['name' => 'Test Branch', 'code' => 'TST-01']);
    $this->serviceType = $this->branch->serviceTypes()->create(['name' => 'Deposits', 'prefix' => 'A']);
    $this->counter = $this->branch->counters()->create(['label' => 'Counter 1']);
});

it('issues sequential ticket numbers per service type', function () {
    $first = $this->service->issueTicket($this->branch, $this->serviceType);
    $second = $this->service->issueTicket($this->branch, $this->serviceType);

    expect($first->ticket_number)->toBe('A001');
    expect($second->ticket_number)->toBe('A002');
    expect($first->events()->where('event', 'issued')->count())->toBe(1);
});

it('serves priority tickets before normal ones, but FIFO within each tier', function () {
    $normal1 = $this->service->issueTicket($this->branch, $this->serviceType, 'normal');
    $vip = $this->service->issueTicket($this->branch, $this->serviceType, 'vip');
    $normal2 = $this->service->issueTicket($this->branch, $this->serviceType, 'normal');
    $accessibility = $this->service->issueTicket($this->branch, $this->serviceType, 'accessibility');

    $calledOrder = collect(range(1, 4))
        ->map(fn () => $this->service->callNext($this->counter)->ticket_number)
        ->values()
        ->all();

    expect($calledOrder)->toBe([
        $vip->ticket_number,
        $accessibility->ticket_number,
        $normal1->ticket_number,
        $normal2->ticket_number,
    ]);
});

it('returns null when no tickets are waiting', function () {
    expect($this->service->callNext($this->counter))->toBeNull();
});

it('does not call the same ticket twice', function () {
    $this->service->issueTicket($this->branch, $this->serviceType);

    $first = $this->service->callNext($this->counter);
    $second = $this->service->callNext($this->counter);

    expect($first)->not->toBeNull();
    expect($second)->toBeNull();
});

it('logs an append-only event trail across the ticket lifecycle', function () {
    $ticket = $this->service->issueTicket($this->branch, $this->serviceType);
    $called = $this->service->callNext($this->counter);
    $this->service->startServing($called);
    $this->service->complete($called->fresh());

    $events = $ticket->fresh()->events()->pluck('event')->all();

    expect($events)->toBe(['issued', 'called', 'serving', 'done']);
});
