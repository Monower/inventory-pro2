<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('orders')->name('orders.')->middleware(['auth'])->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index')->middleware('permission:view order');
        Route::get('/create', [OrderController::class, 'create'])->name('create')->middleware('permission:create order');
        Route::post('/', [OrderController::class, 'store'])->name('store')->middleware('permission:create order');
        Route::get('/show/{id}', [OrderController::class, 'show'])->name('show')->middleware('permission:view order'); // <-- added
        Route::get('/{order}/invoice', [OrderController::class, 'invoice'])->name('invoice')->middleware('permission:view order');
        Route::get('/{order}/receipt', [OrderController::class, 'receipt'])->name('receipt')->middleware('permission:view order');
        Route::get('/{order}/edit', [OrderController::class, 'edit'])->name('edit')->middleware('permission:edit order');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update')->middleware('permission:edit order');
        Route::delete('/delete/{id}', [OrderController::class, 'destroy'])->name('destroy')->middleware('permission:delete order');
    });
});
