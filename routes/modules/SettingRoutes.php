<?php

use App\Http\Controllers\LicenseController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SettingController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
        Route::get('/', [SettingController::class, 'index'])
            ->name('index')
            ->middleware('permission:view settings');
        Route::get('/licensing', [SettingController::class, 'licensing'])
            ->name('licensing')
            ->middleware('permission:view settings');
        // Update without parameter
        Route::post('/', [SettingController::class, 'update'])
            ->name('update')
            ->middleware('permission:edit settings');
        Route::post('/license', [LicenseController::class, 'activate'])
            ->name('license.activate')
            ->middleware('permission:edit settings');
        Route::post('/license/refresh', [LicenseController::class, 'refresh'])
            ->name('license.refresh')
            ->middleware('permission:edit settings');
        Route::delete('/license', [LicenseController::class, 'destroy'])
            ->name('license.destroy')
            ->middleware('permission:edit settings');
    });
});
