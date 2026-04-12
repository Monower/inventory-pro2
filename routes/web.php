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
require __DIR__ . '/modules/ProfileRoutes.php';
require __DIR__ . '/modules/DashboardRoutes.php';
require __DIR__ . '/modules/ProductRoutes.php';
require __DIR__ . '/modules/SettingRoutes.php';
require __DIR__ . '/modules/TenantRoutes.php';
require __DIR__ . '/modules/PlanRoutes.php';
require __DIR__ . '/modules/BillingRoutes.php';
