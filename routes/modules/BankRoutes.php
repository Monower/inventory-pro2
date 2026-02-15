<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BankController;




Route::middleware(['auth'])->group(function () {
    Route::get('/banks', [BankController::class, 'index'])->name('banks.index')->middleware('permission:view bank');
    Route::get('/banks/create', [BankController::class, 'create'])->name('banks.create')->middleware('permission:create bank');
    Route::post('/banks/create', [BankController::class, 'store'])->name('banks.store')->middleware('permission:create bank');
    Route::get('/banks/edit/{bank}', [BankController::class, 'edit'])->name('banks.edit')->middleware('permission:edit bank');
    Route::put('/banks/edit/{bank}', [BankController::class, 'update'])->name('banks.update')->middleware('permission:edit bank');
    Route::delete('/banks/delete/{bank}', [BankController::class, 'destroy'])->name('banks.destroy')->middleware('permission:delete bank');
});