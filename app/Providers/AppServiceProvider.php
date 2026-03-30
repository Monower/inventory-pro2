<?php

namespace App\Providers;

use App\Models\Plan;
use App\Support\CurrentTenant;
use App\Services\BillingService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(CurrentTenant::class, fn () => new CurrentTenant());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'auth' => function () {
                $user = Auth::user();
                return $user ? [
                    'id' => $user->id,
                    'tenant_id' => $user->tenant_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,   // new
                    'phone' => $user->phone,     // new
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null;
            },

            'settings' => function () {
                $tenant = app(CurrentTenant::class)->get();
                $settings = $tenant
                    ? Setting::whereIn('name', ['company_name', 'logo'])->get()->keyBy('name')
                    : collect();

                return [
                    'company_name' => $settings['company_name']->value ?? config('app.name'),
                    'logo_url' => isset($settings['logo']) && $settings['logo']->value
                        ? Storage::url($settings['logo']->value)
                        : null,
                ];
            },

            'company_name' => function () {
                $tenant = app(CurrentTenant::class)->get();
                $setting = $tenant ? Setting::where('name', 'company_name')->first() : null;

                return $setting ? $setting->value : config('app.name', 'Inventory Pro');
            },

            'tenant' => function () {
                $tenantContext = app(CurrentTenant::class);
                $tenant = $tenantContext->get();
                $homeTenant = $tenantContext->homeTenant();

                return $tenant ? [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'domain' => $tenant->domain,
                    'status' => $tenant->status,
                    'switched' => $tenantContext->switched(),
                    'home_tenant_id' => $homeTenant?->id,
                    'home_tenant_name' => $homeTenant?->name,
                ] : null;
            },

            'billing' => function () {
                $tenant = app(CurrentTenant::class)->get();

                if (!$tenant) {
                    return null;
                }

                $subscription = $tenant->currentSubscription?->load(['plan', 'nextPlan']);

                return app(BillingService::class)->summary($subscription);
            },

            'billing_plans' => function () {
                return Plan::query()
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->get(['id', 'name', 'slug', 'monthly_price', 'yearly_price', 'description', 'trial_days']);
            },
        ]);
    }
}
