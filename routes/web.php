<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return to_route('login');
});

Route::fallback(function () {
    return to_route('login');
});

Route::get('/clear', function () {
    Artisan::call('optimize:clear');
    return 'Cleared!';
});

require __DIR__ . '/auth.php';
require __DIR__ . '/modules/BankRoutes.php';
require __DIR__ . '/modules/ProfileRoutes.php';
require __DIR__ . '/modules/DashboardRoutes.php';
require __DIR__ . '/modules/RoleRoutes.php';
require __DIR__ . '/modules/CategoryRoutes.php';
require __DIR__ . '/modules/SubCategoryRoutes.php';
require __DIR__ . '/modules/CustomerRoutes.php';
require __DIR__ . '/modules/UserRoutes.php';
require __DIR__ . '/modules/StaffRoutes.php';
require __DIR__ . '/modules/TransactionRoutes.php';
require __DIR__ . '/modules/ProductRoutes.php';
require __DIR__ . '/modules/AttributeRoutes.php';
require __DIR__ . '/modules/OrderRoutes.php';
require __DIR__ . '/modules/SettingRoutes.php';
require __DIR__ . '/modules/PurchaseRoutes.php';
require __DIR__ . '/modules/SalaryRoutes.php';
