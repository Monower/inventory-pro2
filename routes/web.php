<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\SubcategoriesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return to_route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/sub-categories', [SubcategoriesController::class, 'index'])->name('subcategories.index');
Route::get('/sub-categories/create', [SubcategoriesController::class, 'create'])->name('subcategories.create');
Route::post('/sub-categories/store', [SubcategoriesController::class, 'store'])->name('subcategories.store');
Route::get('/sub-categories/edit/{subcategory_id}', [SubcategoriesController::class, 'edit'])->name('subcategories.edit');
Route::put('/sub-categories/edit/{subcategory}', [SubcategoriesController::class, 'update'])->name('subcategories.update');
Route::delete('/sub-categories/delete/{subcategory_id}', [SubcategoriesController::class, 'destroy'])->name('subcategories.destroy');

Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
Route::get('/customer/create', [CustomerController::class, 'create'])->name('customer.create');
Route::post('/customer/create', [CustomerController::class, 'store'])->name('customer.store');
Route::get('/customer/edit/{customer_id}', [CustomerController::class, 'edit'])->name('customer.edit');
Route::put('/customer/edit/{customer_id}', [CustomerController::class, 'update'])->name('customer.update');
Route::delete('/customer/delete/{customer_id}', [CustomerController::class, 'destroy'])->name('customer.destroy');

Route::get('/staffs', [StaffController::class, 'index'])->name('staffs.index');
Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
Route::post('/staff/create', [StaffController::class, 'store'])->name('staff.store');
Route::get('/staff/edit/{staff_id}', [StaffController::class, 'edit'])->name('staff.edit');
Route::put('/staff/edit/{staff_id}', [StaffController::class, 'update'])->name('staff.update');
Route::delete('/staff/delete/{staff_id}', [StaffController::class, 'destroy'])->name('staff.destroy');

Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
Route::get('/transaction/create', [TransactionController::class, 'create'])->name('transaction.create');
Route::post('/transaction/create', [TransactionController::class, 'store'])->name('transaction.store');
Route::get('/transaction/edit/{transaction_id}', [TransactionController::class, 'edit'])->name('transaction.edit');
Route::put('/transaction/edit/{transaction_id}', [TransactionController::class, 'update'])->name('transaction.update');
Route::delete('/transaction/delete/{transaction_id}', [TransactionController::class, 'destroy'])->name('transaction.destroy');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('permission:view dashboard');

    Route::prefix('roles')->controller(RoleController::class)->group(function () {
        Route::get('/', 'index')->name('roles.index')->middleware('permission:view role');
        Route::get('/create', 'create')->name('role.create')->middleware('permission:create role');
        Route::post('/create', 'store')->name('role.store')->middleware('permission:create role');
        Route::get('/edit/{role_id}', 'edit')->name('role.edit')->middleware('permission:edit role');
        Route::put('/edit/{role_id}', 'update')->name('role.update')->middleware('permission:edit role');
        Route::delete('/delete/{role_id}', 'destroy')->name('role.destroy')->middleware('permission:delete role');
    });

    Route::prefix('products')->controller(ProductController::class)->group(function () {
        Route::get('/', 'index')->name('products.index')->middleware('permission:view product');
        Route::get('/create', 'create')->name('products.create')->middleware('permission:create product');
        Route::post('/create', 'store')->name('products.store')->middleware('permission:create product');
        Route::get('/edit/{product_id}', 'edit')->name('products.edit')->middleware('permission:edit product');
        Route::put('/edit/{product_id}', 'update')->name('products.update')->middleware('permission:edit product');
        Route::delete('/delete/{product_id}', 'destroy')->name('products.destroy')->middleware('permission:delete product');
    });

    Route::prefix('categories')->controller(CategoriesController::class)->group(function () {
        Route::get('/', 'index')->name('categories.index')->middleware('permission:view category');
        Route::get('/create', 'create')->name('categories.create')->middleware('permission:create category');
        Route::post('/create', 'store')->name('categories.store')->middleware('permission:create category');
        Route::get('/edit/{category}', 'edit')->name('categories.edit')->middleware('permission:edit category');
        Route::put('/edit/{category}', 'update')->name('categories.update')->middleware('permission:edit category');
        Route::delete('/delete/{category}', 'destroy')->name('categories.destroy')->middleware('permission:delete category');
    });
});

Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::get('/user/create', [UserController::class, 'create'])->name('user.create');
Route::post('/user/create', [UserController::class, 'store'])->name('user.store');
Route::get('/user/edit/{user_id}', [UserController::class, 'edit'])->name('user.edit');
Route::put('/user/edit/{user_id}', [UserController::class, 'update'])->name('user.update');
Route::delete('/user/delete/{user_id}', [UserController::class, 'destroy'])->name('user.destroy');




require __DIR__ . '/auth.php';
