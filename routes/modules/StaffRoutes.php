<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffController;


Route::middleware(['auth'])->group(function () {
    Route::get('/staffs', [StaffController::class, 'index'])->name('staffs.index')->middleware('permission:view staff');
    Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create')->middleware('permission:create staff');
    Route::post('/staff/create', [StaffController::class, 'store'])->name('staff.store')->middleware('permission:create staff');
    Route::get('/staff/edit/{staff_id}', [StaffController::class, 'edit'])->name('staff.edit')->middleware('permission:edit staff');
    Route::put('/staff/edit/{staff_id}', [StaffController::class, 'update'])->name('staff.update')->middleware('permission:edit staff');
    Route::delete('/staff/delete/{staff_id}', [StaffController::class, 'destroy'])->name('staff.destroy')->middleware('permission:delete staff');
});