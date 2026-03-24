<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;


Route::middleware(['auth'])->group(function () {
    Route::prefix('roles')->controller(RoleController::class)->group(function () {
        Route::get('/', 'index')->name('roles.index')->middleware('permission:view role');
        Route::get('/create', 'create')->name('role.create')->middleware('permission:create role');
        Route::post('/create', 'store')->name('role.store')->middleware(['permission:create role', 'license.feature:role_management']);
        Route::get('/edit/{role_id}', 'edit')->name('role.edit')->middleware('permission:edit role');
        Route::put('/edit/{role_id}', 'update')->name('role.update')->middleware(['permission:edit role', 'license.feature:role_management']);
        Route::delete('/delete/{role_id}', 'destroy')->name('role.destroy')->middleware(['permission:delete role', 'license.feature:role_management']);
    });
});
