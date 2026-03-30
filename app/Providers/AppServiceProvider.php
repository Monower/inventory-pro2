<?php

namespace App\Providers;

use App\Support\CurrentTenant;
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
                $tenant = app(CurrentTenant::class)->get();

                return $tenant ? [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'domain' => $tenant->domain,
                    'status' => $tenant->status,
                ] : null;
            },
        ]);
    }
}
