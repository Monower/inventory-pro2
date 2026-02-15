<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\AdvanceSalaryController;


Route::middleware(['auth'])->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/salaries', [SalaryController::class, 'index'])->name('salaries.index');
        Route::get('/salaries/create', [SalaryController::class, 'create'])->name('salaries.create');
        Route::post('/salaries', [SalaryController::class, 'store'])->name('salaries.store');

        Route::get('/advance-salaries', [AdvanceSalaryController::class, 'index'])->name('advance-salaries.index');
        Route::get('/advance-salaries/create', [AdvanceSalaryController::class, 'create'])->name('advance-salaries.create');
        Route::post('/advance-salaries', [AdvanceSalaryController::class, 'store'])->name('advance-salaries.store');
    });

    Route::put('/salaries/{salary}/mark-paid', [SalaryController::class, 'markPaid'])
        ->name('salaries.markPaid')
        ->middleware(['auth']);
});