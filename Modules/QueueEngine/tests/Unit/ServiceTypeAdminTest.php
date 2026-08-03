<?php

use Illuminate\Support\Facades\Artisan;
use Modules\QueueEngine\Http\Controllers\Api\ServiceTypeController;
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

    $this->controller = app(ServiceTypeController::class);
    $this->branch = Branch::create(['name' => 'Test Branch', 'code' => 'TST-01']);
});

function serviceTypeRequest(array $data): \Illuminate\Http\Request
{
    return \Illuminate\Http\Request::create('/', 'POST', $data);
}

it('creates a service type', function () {
    $response = $this->controller->store(serviceTypeRequest([
        'name' => 'Deposits', 'prefix' => 'A', 'is_active' => '1',
    ]), $this->branch);

    expect($response->name)->toBe('Deposits');
    expect($response->prefix)->toBe('A');
});

it('rejects a duplicate prefix within the same branch', function () {
    $this->branch->serviceTypes()->create(['name' => 'Deposits', 'prefix' => 'A']);

    expect(fn () => $this->controller->store(serviceTypeRequest([
        'name' => 'Loans', 'prefix' => 'A', 'is_active' => '1',
    ]), $this->branch))->toThrow(\Illuminate\Validation\ValidationException::class);
});

it('admin listing includes inactive types, public listing does not', function () {
    $this->branch->serviceTypes()->create(['name' => 'Active', 'prefix' => 'A', 'is_active' => true]);
    $this->branch->serviceTypes()->create(['name' => 'Inactive', 'prefix' => 'B', 'is_active' => false]);

    $adminNames = collect($this->controller->adminIndex($this->branch))->pluck('name')->all();
    $publicNames = collect($this->controller->index($this->branch))->pluck('name')->all();

    expect($adminNames)->toBe(['Active', 'Inactive']);
    expect($publicNames)->toBe(['Active']);
});

it('blocks deleting a service type with ticket history', function () {
    $type = $this->branch->serviceTypes()->create(['name' => 'Deposits', 'prefix' => 'A']);
    Ticket::create([
        'branch_id' => $this->branch->id, 'service_type_id' => $type->id,
        'ticket_number' => 'A001', 'sequence' => 1, 'status' => 'done',
    ]);

    $response = $this->controller->destroy($type);

    expect($response->getStatusCode())->toBe(422);
    expect(\Modules\QueueEngine\Models\ServiceType::find($type->id))->not->toBeNull();
});

it('allows deleting a service type with no ticket history', function () {
    $type = $this->branch->serviceTypes()->create(['name' => 'Deposits', 'prefix' => 'A']);

    $this->controller->destroy($type);

    expect(\Modules\QueueEngine\Models\ServiceType::find($type->id))->toBeNull();
});
