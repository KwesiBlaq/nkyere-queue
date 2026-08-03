<?php

use Illuminate\Support\Facades\Artisan;
use Modules\QueueEngine\Http\Controllers\Api\CounterController;
use Modules\QueueEngine\Models\Branch;
use Modules\QueueEngine\Models\Counter;

beforeEach(function () {
    Artisan::call('migrate', [
        '--path' => [
            'database/migrations/tenant',
            'Modules/QueueEngine/database/migrations/tenant',
        ],
        '--realpath' => false,
    ]);

    $this->controller = app(CounterController::class);
    $this->branch = Branch::create(['name' => 'Test Branch', 'code' => 'TST-01']);
});

function counterRequest(array $data): \Illuminate\Http\Request
{
    return \Illuminate\Http\Request::create('/', 'POST', $data);
}

it('creates a counter', function () {
    $counter = $this->controller->store(counterRequest(['label' => 'Counter 1', 'is_open' => '1']), $this->branch);

    expect($counter->label)->toBe('Counter 1');
    expect($counter->is_open)->toBeTrue();
});

it('admin listing includes closed counters, public listing does not', function () {
    $this->branch->counters()->create(['label' => 'Open', 'is_open' => true]);
    $this->branch->counters()->create(['label' => 'Closed', 'is_open' => false]);

    $adminLabels = collect($this->controller->adminIndex($this->branch))->pluck('label')->all();
    $publicLabels = collect($this->controller->index($this->branch))->pluck('label')->all();

    expect($adminLabels)->toBe(['Closed', 'Open']);
    expect($publicLabels)->toBe(['Open']);
});

it('updates a counter, including closing it', function () {
    $counter = $this->branch->counters()->create(['label' => 'Counter 1', 'is_open' => true]);

    $this->controller->update(counterRequest(['label' => 'Counter 1 Renamed', 'is_open' => '0']), $counter);

    $counter->refresh();
    expect($counter->label)->toBe('Counter 1 Renamed');
    expect($counter->is_open)->toBeFalse();
});

it('deletes a counter', function () {
    $counter = $this->branch->counters()->create(['label' => 'Counter 1']);

    $this->controller->destroy($counter);

    expect(Counter::find($counter->id))->toBeNull();
});
