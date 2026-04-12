<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])
        ->name('index')
        ->middleware('permission:view product');

    Route::get('/create', [ProductController::class, 'createProduct'])
        ->name('create')
        ->middleware('permission:create product');

    Route::post('/', [ProductController::class, 'storeProduct'])
        ->name('store')
        ->middleware('permission:create product');

    Route::get('/{product}', [ProductController::class, 'showProduct'])
        ->whereNumber('product')
        ->name('show')
        ->middleware('permission:view product');

    Route::get('/{product}/edit', [ProductController::class, 'editProduct'])
        ->whereNumber('product')
        ->name('edit')
        ->middleware('permission:edit product');

    Route::put('/{product}', [ProductController::class, 'updateProduct'])
        ->whereNumber('product')
        ->name('update')
        ->middleware('permission:edit product');

    Route::delete('/{product}', [ProductController::class, 'destroyProduct'])
        ->whereNumber('product')
        ->name('destroy')
        ->middleware('permission:delete product');

    Route::get('/categories', [ProductController::class, 'categories'])
        ->name('categories')
        ->middleware('permission:view category');

    Route::get('/categories/create', [ProductController::class, 'createCategory'])
        ->name('categories.create')
        ->middleware('permission:create category');

    Route::post('/categories', [ProductController::class, 'storeCategory'])
        ->name('categories.store')
        ->middleware('permission:create category');

    Route::get('/categories/{category}/edit', [ProductController::class, 'editCategory'])
        ->name('categories.edit')
        ->middleware('permission:edit category');

    Route::put('/categories/{category}', [ProductController::class, 'updateCategory'])
        ->name('categories.update')
        ->middleware('permission:edit category');

    Route::delete('/categories/{category}', [ProductController::class, 'destroyCategory'])
        ->name('categories.destroy')
        ->middleware('permission:delete category');
});
