<?php

namespace App\Providers;

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
        //
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
                $settings = Setting::whereIn('name', ['company_name', 'logo'])->get()->keyBy('name');

                return [
                    'company_name' => $settings['company_name']->value ?? '',
                    'logo_url' => isset($settings['logo']) && $settings['logo']->value
                        ? Storage::url($settings['logo']->value)
                        : null,
                ];
            },
        ]);
    }
}
