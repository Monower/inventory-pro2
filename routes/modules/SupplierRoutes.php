<?php

use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index')->middleware('permission:view supplier');
    Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create')->middleware('permission:create supplier');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store')->middleware(['permission:create supplier', 'license.feature:suppliers']);
    Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show')->middleware('permission:view supplier');
    Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit')->middleware('permission:edit supplier');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update')->middleware(['permission:edit supplier', 'license.feature:suppliers']);
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy')->middleware(['permission:delete supplier', 'license.feature:suppliers']);
    Route::get('/suppliers/{supplier}/payments/create', [SupplierController::class, 'createPayment'])->name('suppliers.payments.create')->middleware('permission:pay supplier due');
    Route::post('/suppliers/{supplier}/payments', [SupplierController::class, 'storePayment'])->name('suppliers.payments.store')->middleware(['permission:pay supplier due', 'license.feature:supplier_payments']);
});
