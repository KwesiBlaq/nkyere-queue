<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Modules\QueueEngine\Models\Branch;
use Modules\Signage\Http\Controllers\Api\PromoContentController;
use Modules\Signage\Models\PromoContent;

beforeEach(function () {
    Artisan::call('migrate', [
        '--path' => [
            'database/migrations/tenant',
            'Modules/QueueEngine/database/migrations/tenant',
            'Modules/Signage/database/migrations/tenant',
        ],
        '--realpath' => false,
    ]);

    Storage::fake('public');

    $this->controller = app(PromoContentController::class);
    $this->branch = Branch::create(['name' => 'Test Branch', 'code' => 'TST-01']);
});

function promoRequest(array $data): \Illuminate\Http\Request
{
    return \Illuminate\Http\Request::create('/', 'POST', $data);
}

it('creates a promo item with an uploaded image', function () {
    $image = UploadedFile::fake()->image('promo.jpg');
    $request = promoRequest(['title' => 'Welcome', 'is_active' => '1']);
    $request->files->set('image', $image);

    $response = $this->controller->store($request, $this->branch);
    $data = $response instanceof \Illuminate\Http\JsonResponse ? $response->getData(true) : $response;

    expect($data['title'])->toBe('Welcome');
    expect($data['image_url'])->not->toBeNull();

    $promo = PromoContent::first();
    Storage::disk('public')->assertExists($promo->image_url);
});

it('admin listing includes inactive items, public listing does not', function () {
    $this->branch->promoContent()->create(['title' => 'Active', 'is_active' => true, 'sort_order' => 1]);
    $this->branch->promoContent()->create(['title' => 'Inactive', 'is_active' => false, 'sort_order' => 2]);

    $adminTitles = collect($this->controller->adminIndex($this->branch))->pluck('title')->all();
    $publicTitles = collect($this->controller->index($this->branch))->pluck('title')->all();

    expect($adminTitles)->toBe(['Active', 'Inactive']);
    expect($publicTitles)->toBe(['Active']);
});

it('replaces the image on update and removes the old file', function () {
    $original = UploadedFile::fake()->image('old.jpg');
    $createRequest = promoRequest(['title' => 'Promo', 'is_active' => '1']);
    $createRequest->files->set('image', $original);
    $this->controller->store($createRequest, $this->branch);

    $promo = PromoContent::first();
    $oldPath = $promo->image_url;
    Storage::disk('public')->assertExists($oldPath);

    $newImage = UploadedFile::fake()->image('new.jpg');
    $updateRequest = promoRequest(['title' => 'Promo Updated', 'is_active' => '1']);
    $updateRequest->files->set('image', $newImage);
    $this->controller->update($updateRequest, $promo);

    $promo->refresh();
    expect($promo->title)->toBe('Promo Updated');
    expect($promo->image_url)->not->toBe($oldPath);
    Storage::disk('public')->assertExists($promo->image_url);
    Storage::disk('public')->assertMissing($oldPath);
});

it('deletes a promo item and its image file', function () {
    $image = UploadedFile::fake()->image('promo.jpg');
    $createRequest = promoRequest(['title' => 'Promo', 'is_active' => '1']);
    $createRequest->files->set('image', $image);
    $this->controller->store($createRequest, $this->branch);

    $promo = PromoContent::first();
    $path = $promo->image_url;

    $this->controller->destroy($promo);

    expect(PromoContent::count())->toBe(0);
    Storage::disk('public')->assertMissing($path);
});
