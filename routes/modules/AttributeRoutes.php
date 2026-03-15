<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AttributeValueController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('attributes')->name('attributes.')->middleware(['auth'])->group(function () {
        Route::get('/', [AttributeController::class, 'index'])->name('index')->middleware('permission:view attribute');
        Route::get('/create', [AttributeController::class, 'create'])->name('create')->middleware('permission:create attribute');
        Route::post('/', [AttributeController::class, 'store'])->name('store')->middleware('permission:create attribute');
        Route::get('/{attribute}/edit', [AttributeController::class, 'edit'])->name('edit')->middleware('permission:edit attribute');
        Route::put('/{attribute}', [AttributeController::class, 'update'])->name('update')->middleware('permission:edit attribute');
        Route::delete('/{attribute}', [AttributeController::class, 'destroy'])->name('destroy')->middleware('permission:delete attribute');
    });

    Route::prefix('attribute-values')->name('attributeValues.')->middleware(['auth'])->group(function () {
        Route::get('/', [AttributeValueController::class, 'index'])->name('index')->middleware('permission:view attribute value');
        Route::post('/', [AttributeValueController::class, 'store'])->name('store')->middleware('permission:create attribute value');
        Route::put('/{attributeValue}', [AttributeValueController::class, 'update'])->name('update')->middleware('permission:edit attribute value');
        Route::delete('/{attributeValue}', [AttributeValueController::class, 'destroy'])->name('destroy')->middleware('permission:delete attribute value');
    });
});
