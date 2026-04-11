<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SettingController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
        Route::get('/', [SettingController::class, 'index'])
            ->name('index')
            ->middleware('role_or_permission:super-admin|view settings');
        // Update without parameter
        Route::post('/', [SettingController::class, 'update'])
            ->name('update')
            ->middleware('role_or_permission:super-admin|edit settings');
    });
});
