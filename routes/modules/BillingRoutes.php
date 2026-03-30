<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\TenantBillingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/billing', [BillingController::class, 'index'])
        ->name('billing.index');

    Route::put('/billing', [BillingController::class, 'update'])
        ->name('billing.update')
        ->middleware('permission:manage billing');

    Route::post('/billing/renew', [BillingController::class, 'renew'])
        ->name('billing.renew')
        ->middleware('permission:manage billing');

    Route::post('/billing/cancel', [BillingController::class, 'cancel'])
        ->name('billing.cancel')
        ->middleware('permission:manage billing');

    Route::post('/billing/resume', [BillingController::class, 'resume'])
        ->name('billing.resume')
        ->middleware('permission:manage billing');

    Route::prefix('super-admin/tenants/{tenant}/billing')->name('super-admin.tenants.billing.')->group(function () {
        Route::get('/', [TenantBillingController::class, 'edit'])
            ->name('edit')
            ->middleware('permission:view tenant');
        Route::put('/', [TenantBillingController::class, 'update'])
            ->name('update')
            ->middleware('permission:edit tenant');
        Route::post('/renew', [TenantBillingController::class, 'renew'])
            ->name('renew')
            ->middleware('permission:edit tenant');
    });
});
