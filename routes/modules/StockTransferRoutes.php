<?php

use App\Http\Controllers\StockTransferController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/stock-transfers', [StockTransferController::class, 'index'])->name('stock-transfers.index')->middleware('permission:view stock transfer');
    Route::get('/stock-transfers/create', [StockTransferController::class, 'create'])->name('stock-transfers.create')->middleware('permission:create stock transfer');
    Route::post('/stock-transfers', [StockTransferController::class, 'store'])->name('stock-transfers.store')->middleware('permission:create stock transfer');
    Route::get('/stock-transfers/{stockTransfer}', [StockTransferController::class, 'show'])->name('stock-transfers.show')->middleware('permission:view stock transfer');
    Route::patch('/stock-transfers/{stockTransfer}/approve', [StockTransferController::class, 'approve'])->name('stock-transfers.approve')->middleware('permission:approve stock transfer');
    Route::patch('/stock-transfers/{stockTransfer}/reject', [StockTransferController::class, 'reject'])->name('stock-transfers.reject')->middleware('permission:approve stock transfer');
    Route::patch('/stock-transfers/{stockTransfer}/dispatch', [StockTransferController::class, 'dispatch'])->name('stock-transfers.dispatch')->middleware('permission:dispatch stock transfer');
    Route::patch('/stock-transfers/{stockTransfer}/receive', [StockTransferController::class, 'receive'])->name('stock-transfers.receive')->middleware('permission:receive stock transfer');
});
