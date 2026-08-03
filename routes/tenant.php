<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\QueueEngine\Http\Controllers\Api\BranchController;
use Modules\QueueEngine\Http\Controllers\Api\CounterController;
use Modules\QueueEngine\Http\Controllers\Api\QueueStateController;
use Modules\QueueEngine\Http\Controllers\Api\ServiceTypeController;
use Modules\QueueEngine\Http\Controllers\Api\TicketController;
use Modules\Signage\Http\Controllers\Api\PromoContentController;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Each bank is identified by its own domain (e.g. demo.nkyere.test). These
| routes are only reachable on a tenant domain, never on the central domain,
| and every request here is scoped to that bank's own isolated database.
|
*/

Route::middleware([
    'api',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('api')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::get('/branch', [BranchController::class, 'current']);
    Route::get('/branches/{branch}/service-types', [ServiceTypeController::class, 'index']);
    Route::get('/branches/{branch}/counters', [CounterController::class, 'index']);
    Route::get('/branches/{branch}/queue-state', [QueueStateController::class, 'show']);
    Route::get('/branches/{branch}/promo-content', [PromoContentController::class, 'index']);
    Route::post('/branches/{branch}/tickets', [TicketController::class, 'store']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        Route::post('/counters/{counter}/call-next', [TicketController::class, 'callNext']);
        Route::post('/tickets/{ticket}/serve', [TicketController::class, 'serve']);
        Route::post('/tickets/{ticket}/complete', [TicketController::class, 'complete']);
        Route::post('/tickets/{ticket}/no-show', [TicketController::class, 'noShow']);
    });
});
