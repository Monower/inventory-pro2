<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index()
    {
        // Fetch branding settings from key-value storage
        $settings = Setting::whereIn('name', ['company_name', 'logo', 'favicon'])->get()->keyBy('name');

        return Inertia::render('settings/index', [
            'settings' => [
                'company_name' => $settings['company_name']->value ?? '',
                'logo_url' => isset($settings['logo']) && $settings['logo']->value
                    ? Storage::url($settings['logo']->value)
                    : null,
                'favicon_url' => isset($settings['favicon']) && $settings['favicon']->value
                    ? Storage::url($settings['favicon']->value)
                    : null,
            ],
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
            'logo' => 'nullable|image|max:2048', // max 2MB
            'favicon' => 'nullable|file|mimes:ico,png,jpg,jpeg,svg,webp|max:1024',
            'remove_logo' => 'nullable|boolean',
            'remove_favicon' => 'nullable|boolean',
        ]);

        // Update or create company_name
        Setting::updateOrCreate(
            ['name' => 'company_name'],
            ['value' => $request->company_name]
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
