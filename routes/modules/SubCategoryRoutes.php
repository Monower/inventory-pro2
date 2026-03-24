<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubcategoriesController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('sub-categories')->controller(SubcategoriesController::class)->group(function () {
        Route::get('/', 'index')->name('subcategories.index')->middleware('permission:view subcategory');
        Route::get('/create', 'create')->name('subcategories.create')->middleware('permission:create subcategory');
        Route::post('/create', 'store')->name('subcategories.store')->middleware(['permission:create subcategory', 'license.feature:subcategories']);
        Route::get('/edit/{subcategory}', 'edit')->name('subcategories.edit')->middleware('permission:edit subcategory');
        Route::put('/edit/{subcategory}', 'update')->name('subcategories.update')->middleware(['permission:edit subcategory', 'license.feature:subcategories']);
        Route::delete('/delete/{subcategory}', 'destroy')->name('subcategories.destroy')->middleware(['permission:delete subcategory', 'license.feature:subcategories']);
    });
});
