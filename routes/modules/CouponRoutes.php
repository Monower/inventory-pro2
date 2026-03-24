<?php

use App\Http\Controllers\CouponController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index')->middleware('permission:view coupon');
    Route::get('/coupons/create', [CouponController::class, 'create'])->name('coupons.create')->middleware('permission:create coupon');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store')->middleware(['permission:create coupon', 'license.feature:coupons']);
    Route::get('/coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('coupons.edit')->middleware('permission:edit coupon');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update')->middleware(['permission:edit coupon', 'license.feature:coupons']);
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy')->middleware(['permission:delete coupon', 'license.feature:coupons']);
});
