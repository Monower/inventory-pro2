<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SettingController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
        Route::get('/', [SettingController::class, 'index'])
            ->name('index')
            ->middleware('permission:view settings');
        // Update without parameter
        Route::post('/', [SettingController::class, 'update'])
            ->name('update')
            ->middleware('permission:edit settings');
    });
});