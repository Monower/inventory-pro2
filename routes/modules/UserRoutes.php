<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;


Route::middleware(['auth'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('permission:view user');
    Route::get('/user/create', [UserController::class, 'create'])->name('user.create')->middleware('permission:create user');
    Route::post('/user/create', [UserController::class, 'store'])->name('user.store')->middleware('permission:create user');
    Route::get('/user/edit/{user_id}', [UserController::class, 'edit'])->name('user.edit')->middleware('permission:edit user');
    Route::put('/user/edit/{user_id}', [UserController::class, 'update'])->name('user.update')->middleware('permission:edit user');
    Route::delete('/user/delete/{user_id}', [UserController::class, 'destroy'])->name('user.destroy')->middleware('permission:delete user');
});