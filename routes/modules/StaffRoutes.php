<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StaffController;


Route::middleware(['auth'])->group(function () {
    Route::get('/employees', [StaffController::class, 'index'])->name('employees.index')->middleware('permission:view staff');
    Route::get('/employee/create', [StaffController::class, 'create'])->name('employee.create')->middleware('permission:create staff');
    Route::post('/employee/create', [StaffController::class, 'store'])->name('employee.store')->middleware('permission:create staff');
    Route::get('/employee/edit/{staff_id}', [StaffController::class, 'edit'])->name('employee.edit')->middleware('permission:edit staff');
    Route::put('/employee/edit/{staff_id}', [StaffController::class, 'update'])->name('employee.update')->middleware('permission:edit staff');
    Route::delete('/employee/delete/{staff_id}', [StaffController::class, 'destroy'])->name('employee.destroy')->middleware('permission:delete staff');
});
