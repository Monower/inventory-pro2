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
use App\Http\Controllers\BankController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\AttributeValueController;
use App\Http\Controllers\OrderController;

Route::get('/', function () {
    return to_route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


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

    Route::prefix('categories')->controller(CategoriesController::class)->group(function () {
        Route::get('/', 'index')->name('categories.index')->middleware('permission:view category');
        Route::get('/create', 'create')->name('categories.create')->middleware('permission:create category');
        Route::post('/create', 'store')->name('categories.store')->middleware('permission:create category');
        Route::get('/edit/{category}', 'edit')->name('categories.edit')->middleware('permission:edit category');
        Route::put('/edit/{category}', 'update')->name('categories.update')->middleware('permission:edit category');
        Route::delete('/delete/{category}', 'destroy')->name('categories.destroy')->middleware('permission:delete category');
    });

    Route::prefix('sub-categories')->controller(SubcategoriesController::class)->group(function () {
        Route::get('/', 'index')->name('subcategories.index')->middleware('permission:view subcategory');
        Route::get('/create', 'create')->name('subcategories.create')->middleware('permission:create subcategory');
        Route::post('/create', 'store')->name('subcategories.store')->middleware('permission:create subcategory');
        Route::get('/edit/{subcategory}', 'edit')->name('subcategories.edit')->middleware('permission:edit subcategory');
        Route::put('/edit/{subcategory}', 'update')->name('subcategories.update')->middleware('permission:edit subcategory');
        Route::delete('/delete/{subcategory}', 'destroy')->name('subcategories.destroy')->middleware('permission:delete subcategory');
    });

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('permission:view customer');
    Route::get('/customer/create', [CustomerController::class, 'create'])->name('customer.create')->middleware('permission:create customer');
    Route::post('/customer/create', [CustomerController::class, 'store'])->name('customer.store')->middleware('permission:create customer');
    Route::get('/customer/edit/{customer_id}', [CustomerController::class, 'edit'])->name('customer.edit')->middleware('permission:edit customer');
    Route::put('/customer/edit/{customer_id}', [CustomerController::class, 'update'])->name('customer.update')->middleware('permission:edit customer');
    Route::delete('/customer/delete/{customer_id}', [CustomerController::class, 'destroy'])->name('customer.destroy')->middleware('permission:delete customer');


    Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('permission:view user');
    Route::get('/user/create', [UserController::class, 'create'])->name('user.create')->middleware('permission:create user');
    Route::post('/user/create', [UserController::class, 'store'])->name('user.store')->middleware('permission:create user');
    Route::get('/user/edit/{user_id}', [UserController::class, 'edit'])->name('user.edit')->middleware('permission:edit user');
    Route::put('/user/edit/{user_id}', [UserController::class, 'update'])->name('user.update')->middleware('permission:edit user');
    Route::delete('/user/delete/{user_id}', [UserController::class, 'destroy'])->name('user.destroy')->middleware('permission:delete user');


    Route::get('/staffs', [StaffController::class, 'index'])->name('staffs.index')->middleware('permission:view staff');
    Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create')->middleware('permission:create staff');
    Route::post('/staff/create', [StaffController::class, 'store'])->name('staff.store')->middleware('permission:create staff');
    Route::get('/staff/edit/{staff_id}', [StaffController::class, 'edit'])->name('staff.edit')->middleware('permission:edit staff');
    Route::put('/staff/edit/{staff_id}', [StaffController::class, 'update'])->name('staff.update')->middleware('permission:edit staff');
    Route::delete('/staff/delete/{staff_id}', [StaffController::class, 'destroy'])->name('staff.destroy')->middleware('permission:delete staff');

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index')->middleware('permission:view transaction');
    Route::get('/transaction/create', [TransactionController::class, 'create'])->name('transaction.create')->middleware('permission:create transaction');
    Route::post('/transaction/create', [TransactionController::class, 'store'])->name('transaction.store')->middleware('permission:create transaction');
    Route::get('/transaction/edit/{transaction_id}', [TransactionController::class, 'edit'])->name('transaction.edit')->middleware('permission:edit transaction');
    Route::put('/transaction/edit/{transaction_id}', [TransactionController::class, 'update'])->name('transaction.update')->middleware('permission:edit transaction');
    Route::delete('/transaction/delete/{transaction_id}', [TransactionController::class, 'destroy'])->name('transaction.destroy')->middleware('permission:delete transaction');


    Route::get('/banks', [BankController::class, 'index'])->name('banks.index')->middleware('permission:view bank');
    Route::get('/banks/create', [BankController::class, 'create'])->name('banks.create')->middleware('permission:create bank');
    Route::post('/banks/create', [BankController::class, 'store'])->name('banks.store')->middleware('permission:create bank');
    Route::get('/banks/edit/{bank}', [BankController::class, 'edit'])->name('banks.edit')->middleware('permission:edit bank');
    Route::put('/banks/edit/{bank}', [BankController::class, 'update'])->name('banks.update')->middleware('permission:edit bank');
    Route::delete('/banks/delete/{bank}', [BankController::class, 'destroy'])->name('banks.destroy')->middleware('permission:delete bank');


    Route::prefix('products')->name('products.')->middleware('auth')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index')->middleware('permission:view product');
        Route::get('/create', [ProductController::class, 'create'])->name('create')->middleware('permission:create product');
        Route::post('/', [ProductController::class, 'store'])->name('store')->middleware('permission:create product');
        Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit')->middleware('permission:edit product');
        Route::put('/{product}', [ProductController::class, 'update'])->name('update')->middleware('permission:edit product');
        Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy')->middleware('permission:delete product');
    });

    Route::prefix('attributes')->name('attributes.')->middleware(['auth'])->group(function () {
        Route::get('/', [AttributeController::class, 'index'])->name('index')->middleware('permission:view attribute');
        Route::get('/create', [AttributeController::class, 'create'])->name('create')->middleware('permission:create attribute');
        Route::post('/', [AttributeController::class, 'store'])->name('store')->middleware('permission:create attribute');
        Route::get('/{attribute}/edit', [AttributeController::class, 'edit'])->name('edit')->middleware('permission:edit attribute');
        Route::put('/{attribute}', [AttributeController::class, 'update'])->name('update')->middleware('permission:edit attribute');
        Route::delete('/{attribute}', [AttributeController::class, 'destroy'])->name('destroy')->middleware('permission:delete attribute');
    });


    Route::prefix('orders')->name('orders.')->middleware(['auth'])->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index')->middleware('permission:view order');
        Route::get('/create', [OrderController::class, 'create'])->name('create')->middleware('permission:create order');
        Route::post('/', [OrderController::class, 'store'])->name('store')->middleware('permission:create order');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show')->middleware('permission:view order'); // <-- added
        Route::get('/{order}/edit', [OrderController::class, 'edit'])->name('edit')->middleware('permission:edit order');
        Route::put('/{order}', [OrderController::class, 'update'])->name('update')->middleware('permission:edit order');
        Route::delete('/{order}', [OrderController::class, 'destroy'])->name('destroy')->middleware('permission:delete order');
    });
});

Route::fallback(function () {
    return to_route('login');
});


require __DIR__ . '/auth.php';
