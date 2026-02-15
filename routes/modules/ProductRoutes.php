<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('products')->name('products.')->middleware('auth')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index')->middleware('permission:view product');
        Route::get('/create', [ProductController::class, 'create'])->name('create')->middleware('permission:create product');
        Route::post('/', [ProductController::class, 'store'])->name('store')->middleware('permission:create product');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit')->middleware('permission:edit product');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update')->middleware('permission:edit product');
        Route::delete('/delete/{id}', [ProductController::class, 'destroy'])->name('destroy')->middleware('permission:delete product');
    });
});