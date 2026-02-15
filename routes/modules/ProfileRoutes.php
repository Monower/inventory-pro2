<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;


Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit')->middleware('permission:edit profile');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update')->middleware('permission:edit profile');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});