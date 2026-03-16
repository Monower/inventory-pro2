<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return to_route('login');
});

Route::fallback(function () {
    return to_route('login');
});

if (app()->environment(['local', 'testing'])) {
    Route::post('/clear', function () {
        Artisan::call('optimize:clear');

        return 'Cleared!';
    })->middleware(['auth', 'permission:edit settings'])->name('system.clear');
}

require __DIR__ . '/auth.php';
require __DIR__ . '/modules/BankRoutes.php';
require __DIR__ . '/modules/ProfileRoutes.php';
require __DIR__ . '/modules/DashboardRoutes.php';
require __DIR__ . '/modules/RoleRoutes.php';
require __DIR__ . '/modules/CategoryRoutes.php';
require __DIR__ . '/modules/SubCategoryRoutes.php';
require __DIR__ . '/modules/CustomerRoutes.php';
require __DIR__ . '/modules/SupplierRoutes.php';
require __DIR__ . '/modules/BranchRoutes.php';
require __DIR__ . '/modules/StaffRoutes.php';
require __DIR__ . '/modules/TransactionRoutes.php';
require __DIR__ . '/modules/ProductRoutes.php';
require __DIR__ . '/modules/AttributeRoutes.php';
require __DIR__ . '/modules/OrderRoutes.php';
require __DIR__ . '/modules/CouponRoutes.php';
require __DIR__ . '/modules/StockLedgerRoutes.php';
require __DIR__ . '/modules/StockTransferRoutes.php';
require __DIR__ . '/modules/SettingRoutes.php';
require __DIR__ . '/modules/PurchaseRoutes.php';
require __DIR__ . '/modules/SalaryRoutes.php';
