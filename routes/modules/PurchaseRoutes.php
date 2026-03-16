<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PurchaseController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('purchases')
        ->name('purchases.')
        ->middleware(['auth'])
        ->group(function () {
            Route::get('/', [PurchaseController::class, 'index'])
                ->name('index')
                ->middleware('permission:view purchase');

            Route::get('/create', [PurchaseController::class, 'create'])
                ->name('create')
                ->middleware('permission:create purchase');

            Route::post('/', [PurchaseController::class, 'store'])
                ->name('store')
                ->middleware('permission:create purchase');

            Route::get('/{purchase}', [PurchaseController::class, 'show'])
                ->name('show')
                ->middleware('permission:view purchase');

            Route::get('/{purchase}/edit', [PurchaseController::class, 'edit'])
                ->name('edit')
                ->middleware('permission:edit purchase');

            Route::put('/{purchase}', [PurchaseController::class, 'update'])
                ->name('update')
                ->middleware('permission:edit purchase');

            Route::get('/{purchase}/payments/create', [PurchaseController::class, 'createPayment'])
                ->name('payments.create')
                ->middleware('permission:pay supplier due');

            Route::post('/{purchase}/payments', [PurchaseController::class, 'storePayment'])
                ->name('payments.store')
                ->middleware('permission:pay supplier due');

            Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])
                ->name('destroy')
                ->middleware('permission:delete purchase');
        });
});
