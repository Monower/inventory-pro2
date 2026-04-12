<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SettingController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
        Route::get('/', [SettingController::class, 'index'])
            ->name('index')
            ->middleware('role_or_permission:super-admin|view settings');
        Route::get('/attributes', [SettingController::class, 'attributes'])
            ->name('attributes')
            ->middleware('permission:view attribute');
        Route::post('/attributes', [SettingController::class, 'storeAttribute'])
            ->name('attributes.store')
            ->middleware('permission:create attribute');
        Route::put('/attributes/{attribute}', [SettingController::class, 'updateAttribute'])
            ->name('attributes.update')
            ->middleware('permission:edit attribute');
        Route::delete('/attributes/{attribute}', [SettingController::class, 'destroyAttribute'])
            ->name('attributes.destroy')
            ->middleware('permission:delete attribute');
        Route::get('/units', [SettingController::class, 'units'])
            ->name('units')
            ->middleware('permission:view unit');
        Route::post('/units', [SettingController::class, 'storeUnit'])
            ->name('units.store')
            ->middleware('permission:create unit');
        Route::put('/units/{unit}', [SettingController::class, 'updateUnit'])
            ->name('units.update')
            ->middleware('permission:edit unit');
        Route::delete('/units/{unit}', [SettingController::class, 'destroyUnit'])
            ->name('units.destroy')
            ->middleware('permission:delete unit');
        // Update without parameter
        Route::post('/', [SettingController::class, 'update'])
            ->name('update')
            ->middleware('role_or_permission:super-admin|edit settings');
    });
});
