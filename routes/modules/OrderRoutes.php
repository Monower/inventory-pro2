<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('orders')->name('orders.')->middleware(['auth'])->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index')->middleware('permission:view order');
        Route::get('/create', [OrderController::class, 'create'])->name('create')->middleware('permission:create order');
        Route::post('/', [OrderController::class, 'store'])->name('store')->middleware('permission:create order');
        Route::get('/show/{id}', [OrderController::class, 'show'])->name('show')->middleware('permission:view order');
        Route::get('/{order}/invoice', [OrderController::class, 'invoice'])->name('invoice')->middleware('permission:print order invoice');
        Route::get('/{order}/payments/create', [OrderController::class, 'createPayment'])->name('payments.create')->middleware('permission:collect order payment');
        Route::post('/{order}/payments', [OrderController::class, 'storePayment'])->name('payments.store')->middleware('permission:collect order payment');
        Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('status.update')->middleware('permission:change order status');
        Route::patch('/{order}/fulfillment', [OrderController::class, 'updateFulfillment'])->name('fulfillment.update')->middleware('permission:manage order fulfillment');
        Route::get('/{order}/refunds/create', [OrderController::class, 'createRefund'])->name('refunds.create')->middleware('permission:refund order');
        Route::post('/{order}/refunds', [OrderController::class, 'storeRefund'])->name('refunds.store')->middleware('permission:refund order');
        Route::patch('/{order}/refunds/{refund}/approve', [OrderController::class, 'approveRefund'])->name('refunds.approve')->middleware('permission:approve refund case');
        Route::patch('/{order}/refunds/{refund}/reject', [OrderController::class, 'rejectRefund'])->name('refunds.reject')->middleware('permission:reject refund case');
        Route::get('/{order}/edit', [OrderController::class, 'edit'])->name('edit')->middleware('permission:edit order');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update')->middleware('permission:edit order');
        Route::delete('/delete/{id}', [OrderController::class, 'destroy'])->name('destroy')->middleware('permission:delete order');
    });
});
