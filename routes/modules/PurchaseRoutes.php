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

            Route::get('/{purchase}/invoice/pdf', [PurchaseController::class, 'downloadInvoicePdf'])
                ->name('invoice.pdf')
                ->middleware('permission:view purchase');

            Route::get('/{purchase}', [PurchaseController::class, 'show'])
                ->name('show')
                ->middleware('permission:view purchase');

            Route::get('/{purchase}/edit', [PurchaseController::class, 'edit'])
                ->name('edit')
                ->middleware('permission:edit purchase');

            Route::put('/{purchase}', [PurchaseController::class, 'update'])
                ->name('update')
                ->middleware('permission:edit purchase');

            Route::delete('/{purchase}', [PurchaseController::class, 'destroy'])
                ->name('destroy')
                ->middleware('permission:delete purchase');
        });
});
