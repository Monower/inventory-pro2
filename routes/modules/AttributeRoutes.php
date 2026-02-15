<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttributeController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('attributes')->name('attributes.')->middleware(['auth'])->group(function () {
        Route::get('/', [AttributeController::class, 'index'])->name('index')->middleware('permission:view attribute');
        Route::get('/create', [AttributeController::class, 'create'])->name('create')->middleware('permission:create attribute');
        Route::post('/', [AttributeController::class, 'store'])->name('store')->middleware('permission:create attribute');
        Route::get('/{attribute}/edit', [AttributeController::class, 'edit'])->name('edit')->middleware('permission:edit attribute');
        Route::put('/{attribute}', [AttributeController::class, 'update'])->name('update')->middleware('permission:edit attribute');
        Route::delete('/{attribute}', [AttributeController::class, 'destroy'])->name('destroy')->middleware('permission:delete attribute');
    });
});