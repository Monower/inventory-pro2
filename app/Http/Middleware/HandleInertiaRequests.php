<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Setting;
use App\Services\Licensing\LicenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $licenseService = app(LicenseService::class);
        $settings = Setting::whereIn('name', ['company_name', 'logo', 'favicon', 'phone_digits', 'currency_symbol', 'currency_code', 'product_units'])->get()->keyBy('name');
        $companyName = $settings['company_name']->value ?? 'Default Company Name';
        $phoneDigits = max((int) ($settings['phone_digits']->value ?? 11), 1);
        $currencySymbol = trim((string) ($settings['currency_symbol']->value ?? 'TK')) ?: 'TK';
        $currencyCode = trim((string) ($settings['currency_code']->value ?? 'BDT')) ?: 'BDT';
        $productUnits = collect(preg_split('/\r\n|\r|\n/', (string) ($settings['product_units']->value ?? "pcs\nkg\nliter")) ?: [])
            ->map(fn ($unit) => trim($unit))
            ->filter()
            ->unique()
            ->values()
            ->all();
        $user = $request->user()?->loadMissing('branch');
        $accessibleBranches = collect();
        $activeBranch = null;

        if ($user) {
            $accessibleBranches = $user->branch_id
                ? Branch::query()->whereKey($user->branch_id)->get()
                : Branch::query()->where('is_active', true)->orderBy('name')->get();

            $activeBranch = $accessibleBranches->firstWhere('id', $request->session()->get('active_branch_id'))
                ?? $user->branch
                ?? $accessibleBranches->first();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'email' => $user->email,
                    'branch_id' => $user->branch_id,
                    'branch' => $user->branch ? [
                        'id' => $user->branch->id,
                        'name' => $user->branch->name,
                        'code' => $user->branch->code,
                    ] : null,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'activeBranch' => $activeBranch ? [
                'id' => $activeBranch->id,
                'name' => $activeBranch->name,
                'code' => $activeBranch->code,
            ] : null,
            'accessibleBranches' => $accessibleBranches->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
            ])->values(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'createdCustomer' => fn () => $request->session()->get('createdCustomer'),
            ],
            'settings' => [
                'company_name' => $companyName,
                'phone_digits' => $phoneDigits,
                'currency_symbol' => $currencySymbol,
                'currency_code' => $currencyCode,
                'product_units' => $productUnits,
                'logo_url' => isset($settings['logo']) && $settings['logo']->value
                    ? Storage::url($settings['logo']->value)
                    : null,
                'favicon_url' => isset($settings['favicon']) && $settings['favicon']->value
                    ? Storage::url($settings['favicon']->value)
                    : null,
            ],
            'license' => $licenseService->frontendState(),
            'planCatalog' => $licenseService->planCatalog(),
            'company_name' => $companyName,
        ]);
    }
}
