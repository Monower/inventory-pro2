<?php

use App\Http\Controllers\StockLedgerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/stock-ledgers', [StockLedgerController::class, 'index'])->name('stock-ledgers.index')->middleware('permission:view stock ledger');
});
