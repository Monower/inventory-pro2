<?php

use App\Http\Controllers\TenantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::get('/tenants', [TenantController::class, 'index'])
        ->name('tenants.index')
        ->middleware('permission:view tenant');

    Route::post('/tenants/{tenant}/switch', [TenantController::class, 'switch'])
        ->name('tenants.switch')
        ->middleware('permission:edit tenant');

    Route::delete('/tenants/switch', [TenantController::class, 'clearSwitch'])
        ->name('tenants.clear-switch')
        ->middleware('permission:edit tenant');

    Route::put('/tenants/{tenant}', [TenantController::class, 'update'])
        ->name('tenants.update')
        ->middleware('permission:edit tenant');
});
