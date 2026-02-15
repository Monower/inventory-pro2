<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;


Route::middleware(['auth'])->group(function () {
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index')->middleware('permission:view transaction');
    Route::get('/transaction/create', [TransactionController::class, 'create'])->name('transaction.create')->middleware('permission:create transaction');
    Route::post('/transaction/create', [TransactionController::class, 'store'])->name('transaction.store')->middleware('permission:create transaction');
    Route::get('/transaction/edit/{transaction_id}', [TransactionController::class, 'edit'])->name('transaction.edit')->middleware('permission:edit transaction');
    Route::put('/transaction/edit/{transaction_id}', [TransactionController::class, 'update'])->name('transaction.update')->middleware('permission:edit transaction');
    Route::delete('/transaction/delete/{transaction_id}', [TransactionController::class, 'destroy'])->name('transaction.destroy')->middleware('permission:delete transaction');
});