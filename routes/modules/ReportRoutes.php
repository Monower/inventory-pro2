<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])
            ->name('index')
            ->middleware('permission:view report');

        Route::get('/orders', [ReportController::class, 'orders'])
            ->name('orders')
            ->middleware('permission:view report');
        Route::get('/orders/export/excel', [ReportController::class, 'exportOrdersExcel'])
            ->name('orders.export.excel')
            ->middleware('permission:view report');

        Route::get('/purchases', [ReportController::class, 'purchases'])
            ->name('purchases')
            ->middleware('permission:view report');
        Route::get('/purchases/export/excel', [ReportController::class, 'exportPurchasesExcel'])
            ->name('purchases.export.excel')
            ->middleware('permission:view report');

        Route::get('/salaries', [ReportController::class, 'salaries'])
            ->name('salaries')
            ->middleware('permission:view report');
        Route::get('/salaries/export/excel', [ReportController::class, 'exportSalariesExcel'])
            ->name('salaries.export.excel')
            ->middleware('permission:view report');

        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])
            ->name('profit-loss')
            ->middleware('permission:view report');
        Route::get('/profit-loss/export/excel', [ReportController::class, 'exportProfitLossExcel'])
            ->name('profit-loss.export.excel')
            ->middleware('permission:view report');
        Route::get('/profit-loss/export/pdf', [ReportController::class, 'exportProfitLossPdf'])
            ->name('profit-loss.export.pdf')
            ->middleware('permission:view report');
    });
});
