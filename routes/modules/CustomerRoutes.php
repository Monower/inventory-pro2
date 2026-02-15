<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;


Route::middleware(['auth'])->group(function () {
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('permission:view customer');
    Route::get('/customer/create', [CustomerController::class, 'create'])->name('customer.create')->middleware('permission:create customer');
    Route::post('/customer/create', [CustomerController::class, 'store'])->name('customer.store')->middleware('permission:create customer');
    Route::get('/customer/edit/{customer_id}', [CustomerController::class, 'edit'])->name('customer.edit')->middleware('permission:edit customer');
    Route::put('/customer/edit/{customer_id}', [CustomerController::class, 'update'])->name('customer.update')->middleware('permission:edit customer');
    Route::delete('/customer/delete/{customer_id}', [CustomerController::class, 'destroy'])->name('customer.destroy')->middleware('permission:delete customer');
});