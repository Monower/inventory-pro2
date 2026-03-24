<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriesController;

Route::middleware(['auth'])->group(function () {
    Route::prefix('categories')->controller(CategoriesController::class)->group(function () {
        Route::get('/', 'index')->name('categories.index')->middleware('permission:view category');
        Route::get('/create', 'create')->name('categories.create')->middleware('permission:create category');
        Route::post('/create', 'store')->name('categories.store')->middleware(['permission:create category', 'license.feature:categories']);
        Route::get('/edit/{category}', 'edit')->name('categories.edit')->middleware('permission:edit category');
        Route::put('/edit/{category}', 'update')->name('categories.update')->middleware(['permission:edit category', 'license.feature:categories']);
        Route::delete('/delete/{category}', 'destroy')->name('categories.destroy')->middleware(['permission:delete category', 'license.feature:categories']);
    });
});
