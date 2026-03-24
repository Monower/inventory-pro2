<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\Licensing\LicenseService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function __construct(
        protected LicenseService $licenseService
    ) {
    }

    /**
     * Display the settings page.
     */
    public function index()
    {
        // Fetch branding settings from key-value storage
        $settings = Setting::whereIn('name', ['company_name', 'logo', 'favicon', 'phone_digits', 'currency_symbol', 'currency_code', 'product_units'])->get()->keyBy('name');

        return Inertia::render('settings/index', [
            'settings' => [
                'company_name' => $settings['company_name']->value ?? '',
                'phone_digits' => (int) ($settings['phone_digits']->value ?? 11),
                'currency_symbol' => $settings['currency_symbol']->value ?? 'TK',
                'currency_code' => $settings['currency_code']->value ?? 'BDT',
                'product_units' => $settings['product_units']->value ?? "pcs\nkg\nliter",
                'logo_url' => isset($settings['logo']) && $settings['logo']->value
                    ? Storage::url($settings['logo']->value)
                    : null,
                'favicon_url' => isset($settings['favicon']) && $settings['favicon']->value
                    ? Storage::url($settings['favicon']->value)
                    : null,
            ],
        ]);
    }

    public function licensing()
    {
        return Inertia::render('settings/licensing', [
            'license' => $this->licenseService->frontendState(),
            'planCatalog' => $this->licenseService->planCatalog(),
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        // Validate inputs
        $request->validate([
            'company_name' => 'required|string|max:255',
            'phone_digits' => 'required|integer|min:1|max:20',
            'currency_symbol' => 'required|string|max:10',
            'currency_code' => 'required|string|max:10',
            'product_units' => 'required|string',
            'logo' => 'nullable|image|max:2048', // max 2MB
            'favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg,svg,webp|max:1024',
            'remove_logo' => 'nullable|boolean',
            'remove_favicon' => 'nullable|boolean',
        ]);

        $productUnits = collect(preg_split('/\r\n|\r|\n/', (string) $request->input('product_units')) ?: [])
            ->map(fn ($unit) => trim($unit))
            ->filter()
            ->unique()
            ->values();

        if ($productUnits->isEmpty()) {
            return back()->withErrors([
                'product_units' => 'Please provide at least one product unit.',
            ]);
        }

        // Update or create company_name
        Setting::updateOrCreate(
            ['name' => 'company_name'],
            ['value' => $request->company_name]
        );

        Setting::updateOrCreate(
            ['name' => 'phone_digits'],
            ['value' => (string) $request->integer('phone_digits')]
        );

        Setting::updateOrCreate(
            ['name' => 'currency_symbol'],
            ['value' => trim((string) $request->input('currency_symbol'))]
        );

        Setting::updateOrCreate(
            ['name' => 'currency_code'],
            ['value' => strtoupper(trim((string) $request->input('currency_code')))]
        );

        Setting::updateOrCreate(
            ['name' => 'product_units'],
            ['value' => $productUnits->implode("\n")]
        );

        if ($request->boolean('remove_logo')) {
            $this->deleteBrandAsset('logo');
        }

        if ($request->hasFile('logo')) {
            $path = $this->storeBrandAsset($request->file('logo'), 'logo', 'logos');

            Setting::updateOrCreate(['name' => 'logo'], ['value' => $path]);
        }

        if ($request->boolean('remove_favicon')) {
            $this->deleteBrandAsset('favicon');
        }

        if ($request->hasFile('favicon')) {
            $path = $this->storeBrandAsset($request->file('favicon'), 'favicon', 'favicons');

            Setting::updateOrCreate(['name' => 'favicon'], ['value' => $path]);
        }

        // Redirect back with a flash message (valid Inertia response)
        return redirect()->route('settings.index')->with('success', 'Settings updated successfully.');
    }

    private function storeBrandAsset($file, string $settingName, string $directory): string
    {
        $this->deleteBrandAsset($settingName);

        $filename = time() . '_' . $file->getClientOriginalName();

        return $file->storeAs($directory, $filename, 'public');
    }

    private function deleteBrandAsset(string $settingName): void
    {
        $existingAsset = Setting::where('name', $settingName)->first();
        if (! $existingAsset) {
            return;
        }

        if ($existingAsset->value && Storage::disk('public')->exists($existingAsset->value)) {
            Storage::disk('public')->delete($existingAsset->value);
        }

        $existingAsset->delete();
    }
}
