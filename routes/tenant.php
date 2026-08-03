<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\StaffController;
use Modules\QueueEngine\Http\Controllers\Api\BranchController;
use Modules\QueueEngine\Http\Controllers\Api\CounterController;
use Modules\QueueEngine\Http\Controllers\Api\QueueStateController;
use Modules\QueueEngine\Http\Controllers\Api\ReportingController;
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

        Route::middleware('role:branch_admin')->group(function () {
            Route::get('/branches/{branch}/reports/overview', [ReportingController::class, 'overview']);
            Route::get('/branches/{branch}/reports/service-types', [ReportingController::class, 'serviceTypeVolume']);
            Route::get('/branches/{branch}/reports/tellers', [ReportingController::class, 'tellerThroughput']);

            Route::get('/branches/{branch}/admin/promo-content', [PromoContentController::class, 'adminIndex']);
            Route::post('/branches/{branch}/admin/promo-content', [PromoContentController::class, 'store']);
            Route::put('/admin/promo-content/{promo}', [PromoContentController::class, 'update']);
            Route::delete('/admin/promo-content/{promo}', [PromoContentController::class, 'destroy']);

            Route::get('/branches/{branch}/admin/service-types', [ServiceTypeController::class, 'adminIndex']);
            Route::post('/branches/{branch}/admin/service-types', [ServiceTypeController::class, 'store']);
            Route::put('/admin/service-types/{serviceType}', [ServiceTypeController::class, 'update']);
            Route::delete('/admin/service-types/{serviceType}', [ServiceTypeController::class, 'destroy']);

            Route::get('/branches/{branch}/admin/counters', [CounterController::class, 'adminIndex']);
            Route::post('/branches/{branch}/admin/counters', [CounterController::class, 'store']);
            Route::put('/admin/counters/{counter}', [CounterController::class, 'update']);
            Route::delete('/admin/counters/{counter}', [CounterController::class, 'destroy']);

            Route::get('/admin/staff', [StaffController::class, 'index']);
            Route::post('/admin/staff', [StaffController::class, 'store']);
            Route::put('/admin/staff/{user}', [StaffController::class, 'update']);
            Route::delete('/admin/staff/{user}', [StaffController::class, 'destroy']);
        });
    });
});
