<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\StaffController;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Artisan::call('migrate', [
        '--path' => [
            'database/migrations/tenant',
            'Modules/Auth/database/migrations/tenant',
        ],
        '--realpath' => false,
    ]);

    foreach (['branch_admin', 'teller'] as $role) {
        Role::findOrCreate($role);
    }

    $this->controller = app(StaffController::class);
    $this->auth = app(AuthController::class);

    $this->admin = User::factory()->create(['is_active' => true]);
    $this->admin->assignRole('branch_admin');
});

function staffRequest(array $data): \Illuminate\Http\Request
{
    return \Illuminate\Http\Request::create('/', 'POST', $data);
}

function actingAsStaff($user, \Illuminate\Http\Request $request): \Illuminate\Http\Request
{
    $request->setUserResolver(fn () => $user);

    return $request;
}

it('creates a teller with a hashed password and one role', function () {
    $response = $this->controller->store(staffRequest([
        'name' => 'New Teller', 'email' => 'new@nkyere.test', 'password' => 'password123',
        'role' => 'teller', 'is_active' => '1',
    ]));

    expect($response['role'])->toBe('teller');

    $user = User::where('email', 'new@nkyere.test')->first();
    expect($user)->not->toBeNull();
    expect(\Illuminate\Support\Facades\Hash::check('password123', $user->password))->toBeTrue();
});

it('updates a staff member without changing the password when none is given', function () {
    $teller = User::factory()->create(['is_active' => true, 'password' => bcrypt('original-pass')]);
    $teller->assignRole('teller');

    $this->controller->update(staffRequest([
        'name' => 'Renamed', 'email' => $teller->email, 'role' => 'teller', 'is_active' => '0',
    ]), $teller);

    $teller->refresh();
    expect($teller->name)->toBe('Renamed');
    expect($teller->is_active)->toBeFalse();
    expect(\Illuminate\Support\Facades\Hash::check('original-pass', $teller->password))->toBeTrue();
});

it('updates the password when a new one is given', function () {
    $teller = User::factory()->create(['is_active' => true, 'password' => bcrypt('original-pass')]);
    $teller->assignRole('teller');

    $this->controller->update(staffRequest([
        'name' => $teller->name, 'email' => $teller->email, 'password' => 'brand-new-pass',
        'role' => 'teller', 'is_active' => '1',
    ]), $teller);

    $teller->refresh();
    expect(\Illuminate\Support\Facades\Hash::check('brand-new-pass', $teller->password))->toBeTrue();
});

it('rejects login for a deactivated user', function () {
    $teller = User::factory()->create(['is_active' => false, 'password' => bcrypt('password123')]);
    $teller->assignRole('teller');

    $request = staffRequest(['email' => $teller->email, 'password' => 'password123']);

    expect(fn () => $this->auth->login($request))->toThrow(\Illuminate\Validation\ValidationException::class);
});

it('blocks an admin from deleting their own account', function () {
    $request = actingAsStaff($this->admin, \Illuminate\Http\Request::create('/', 'DELETE'));

    $response = $this->controller->destroy($request, $this->admin);

    expect($response->getStatusCode())->toBe(422);
    expect(User::find($this->admin->id))->not->toBeNull();
});

it('blocks deleting the last active branch admin', function () {
    $otherAdmin = User::factory()->create(['is_active' => true]);
    $otherAdmin->assignRole('branch_admin');

    // A different logged-in admin deletes $this->admin — but $otherAdmin is also active,
    // so this should succeed (not the last one).
    $request = actingAsStaff($otherAdmin, \Illuminate\Http\Request::create('/', 'DELETE'));
    $this->controller->destroy($request, $this->admin);
    expect(User::find($this->admin->id))->toBeNull();

    // Now only $otherAdmin remains — deleting them (as themself would be blocked by the
    // self-delete guard, so simulate a different actor) should be blocked as the last admin.
    $actor = User::factory()->create(['is_active' => true]);
    $actor->assignRole('teller');
    $request2 = actingAsStaff($actor, \Illuminate\Http\Request::create('/', 'DELETE'));
    $response = $this->controller->destroy($request2, $otherAdmin);

    expect($response->getStatusCode())->toBe(422);
    expect(User::find($otherAdmin->id))->not->toBeNull();
});
