<?php

use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('super-admin/plans')->name('super-admin.plans.')->group(function () {
    Route::get('/', [PlanController::class, 'index'])
        ->name('index')
        ->middleware('permission:view plan');
    Route::get('/create', [PlanController::class, 'create'])
        ->name('create')
        ->middleware('permission:create plan');
    Route::post('/', [PlanController::class, 'store'])
        ->name('store')
        ->middleware('permission:create plan');
    Route::put('/trial-notice', [PlanController::class, 'updateTrialNotice'])
        ->name('trial-notice.update')
        ->middleware('permission:edit plan');
    Route::get('/{plan}/edit', [PlanController::class, 'edit'])
        ->name('edit')
        ->middleware('permission:edit plan');
    Route::put('/{plan}', [PlanController::class, 'update'])
        ->name('update')
        ->middleware('permission:edit plan');
    Route::delete('/{plan}', [PlanController::class, 'destroy'])
        ->name('destroy')
        ->middleware('permission:delete plan');
});
