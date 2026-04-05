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
use Illuminate\Support\Str;
use Throwable;

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
                return [
                    'user' => $user ? [
                        'id' => $user->id,
                        'tenant_id' => $user->tenant_id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'phone' => $user->phone,
                        'is_super_admin' => $user->isSuperAdmin(),
                        'is_tenant_context' => $user->isOperatingInTenantContext(),
                        'dashboard_route_name' => $user->dashboardRouteName(),
                        'roles' => $user->getRoleNames(),
                        'permissions' => $user->getAllPermissions()->pluck('name'),
                    ] : null,
                ];
            },

            'settings' => function () {
                $tenant = app(CurrentTenant::class)->get();
                $settings = $tenant
                    ? Setting::whereIn('name', [
                        'company_name',
                        'company_address',
                        'company_phone',
                        'receipt_footer',
                        'logo',
                    ])->get()->keyBy('name')
                    : collect();

                return [
                    'company_name' => $settings['company_name']->value ?? config('app.name'),
                    'company_address' => $settings['company_address']->value ?? '',
                    'company_phone' => $settings['company_phone']->value ?? '',
                    'receipt_footer' => $settings['receipt_footer']->value ?? 'Thank you for shopping with us.',
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
                try {
                    $tenant = app(CurrentTenant::class)->get();

                    if (!$tenant) {
                        return null;
                    }

                    $subscription = $tenant->currentSubscription?->load(['plan', 'nextPlan']);

                    return app(BillingService::class)->summary($subscription);
                } catch (Throwable $e) {
                    report($e);

                    return null;
                }
            },

            'billing_plans' => function () {
                try {
                    $planFeatures = config('plan_features', []);

                    return Plan::query()
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->get(['id', 'name', 'slug', 'monthly_price', 'yearly_price', 'description', 'trial_days'])
                        ->map(function (Plan $plan) use ($planFeatures) {
                            $featureConfig = $planFeatures[Str::lower($plan->slug)] ?? [];

                            return [
                                'id' => $plan->id,
                                'name' => $plan->name,
                                'slug' => $plan->slug,
                                'monthly_price' => $plan->monthly_price,
                                'yearly_price' => $plan->yearly_price,
                                'description' => $featureConfig['description'] ?? $plan->description,
                                'trial_days' => $plan->trial_days,
                                'modules' => $featureConfig['modules'] ?? [],
                            ];
                        })
                        ->values();
                } catch (Throwable $e) {
                    report($e);

                    return collect();
                }
            },

            'subscription_access' => function () {
                try {
                    $user = Auth::user();
                    $tenant = app(CurrentTenant::class)->get();

                    if (!$user || !$tenant || ($user->isSuperAdmin() && !$user->isOperatingInTenantContext())) {
                        return [
                            'read_only' => false,
                            'message' => null,
                        ];
                    }

                    $subscription = $tenant->currentSubscription;

                    if (!$subscription) {
                        return [
                            'read_only' => true,
                            'message' => 'Your workspace is in read-only mode. You can browse pages, but creating, updating, and deleting records will stay locked until you purchase a plan.',
                        ];
                    }

                    $subscription = app(BillingService::class)->sync($subscription);

                    if (in_array($subscription->status, ['expired', 'cancelled'], true)) {
                        return [
                            'read_only' => true,
                            'message' => 'Your plan is no longer active. You can still browse the workspace, but create, update, and delete actions are disabled until billing is restored.',
                        ];
                    }

                    return [
                        'read_only' => false,
                        'message' => null,
                    ];
                } catch (Throwable $e) {
                    report($e);

                    return [
                        'read_only' => false,
                        'message' => null,
                    ];
                }
            },
        ]);
    }
}
