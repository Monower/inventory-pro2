<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SuperAdminDashboardController;


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('permission:view dashboard');
    Route::get('/super-admin/dashboard', [SuperAdminDashboardController::class, 'index'])
        ->name('super-admin.dashboard')
        ->middleware('permission:view dashboard');
});
