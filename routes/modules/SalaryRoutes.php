<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\AdvanceSalaryController;


Route::middleware(['auth'])->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/salaries', [SalaryController::class, 'index'])->name('salaries.index')->middleware('permission:view salary');
        Route::get('/salaries/create', [SalaryController::class, 'create'])->name('salaries.create')->middleware('permission:create salary');
        Route::post('/salaries', [SalaryController::class, 'store'])->name('salaries.store')->middleware('permission:create salary');
        Route::delete('/salaries/{salary}', [SalaryController::class, 'destroy'])->name('salaries.destroy')->middleware('permission:delete salary');

        Route::get('/advance-salaries', [AdvanceSalaryController::class, 'index'])->name('advance-salaries.index')->middleware('permission:view advance salary');
        Route::get('/advance-salaries/create', [AdvanceSalaryController::class, 'create'])->name('advance-salaries.create')->middleware('permission:create advance salary');
        Route::post('/advance-salaries', [AdvanceSalaryController::class, 'store'])->name('advance-salaries.store')->middleware('permission:create advance salary');
        Route::get('/advance-salaries/{advanceSalary}/edit', [AdvanceSalaryController::class, 'edit'])->name('advance-salaries.edit')->middleware('permission:edit advance salary');
        Route::put('/advance-salaries/{advanceSalary}', [AdvanceSalaryController::class, 'update'])->name('advance-salaries.update')->middleware('permission:edit advance salary');
        Route::delete('/advance-salaries/{advanceSalary}', [AdvanceSalaryController::class, 'destroy'])->name('advance-salaries.destroy')->middleware('permission:delete advance salary');
    });

    Route::put('/salaries/{salary}/mark-paid', [SalaryController::class, 'markPaid'])
        ->name('salaries.markPaid')
        ->middleware(['auth', 'permission:edit salary']);
});
