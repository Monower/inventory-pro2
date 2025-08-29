<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\SubcategoriesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;

Route::get('/', function () {
    return to_route('login');
});

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



Route::get('/categories', [CategoriesController::class, 'index'])->name('categories.index');
Route::get('/categories/create', [CategoriesController::class, 'create'])->name('categories.create');
Route::post('/categories/create', [CategoriesController::class, 'store'])->name('categories.store');
Route::delete('/categories/{category}', [CategoriesController::class, 'destroy'])->name('categories.destroy');
Route::get('/categories/edit/{category}', [CategoriesController::class, 'edit'])->name('categories.edit');
Route::put('/categories/edit/{category}', [CategoriesController::class, 'update'])->name('categories.update');


Route::get('/sub-categories', [SubcategoriesController::class, 'index'])->name('subcategories.index');
Route::get('/sub-categories/create', [SubcategoriesController::class, 'create'])->name('subcategories.create');
Route::post('/sub-categories/store', [SubcategoriesController::class, 'store'])->name('subcategories.store');
Route::get('/sub-categories/edit/{subcategory_id}', [SubcategoriesController::class, 'edit'])->name('subcategories.edit'); 
Route::put('/sub-categories/edit/{subcategory}', [SubcategoriesController::class, 'update'])->name('subcategories.update');
Route::delete('/sub-categories/delete/{subcategory_id}', [SubcategoriesController::class, 'destroy'])->name('subcategories.destroy');



Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
Route::post('/products/create', [ProductController::class, 'store'])->name('products.store');
Route::get('/products/edit/{product_id}', [ProductController::class, 'edit'])->name('products.edit'); 
Route::put('/products/edit/{product_id}', [ProductController::class, 'update'])->name('products.update');
Route::delete('/products/delete/{product_id}', [ProductController::class, 'destroy'])->name('products.destroy');


Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
Route::get('/customer/create', [CustomerController::class, 'create'])->name('customer.create');
Route::post('/customer/create', [CustomerController::class, 'store'])->name('customer.store');
Route::get('/customer/edit/{customer_id}', [CustomerController::class, 'edit'])->name('customer.edit'); 
Route::put('/customer/edit/{customer_id}', [CustomerController::class, 'update'])->name('customer.update');
Route::delete('/customer/delete/{customer_id}', [CustomerController::class, 'destroy'])->name('customer.destroy');




require __DIR__.'/auth.php';
