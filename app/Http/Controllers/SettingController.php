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
        // Fetch company_name and logo from key-value settings
        $settings = Setting::whereIn('name', ['company_name', 'logo'])->get()->keyBy('name');

        return Inertia::render('settings/index', [
            'settings' => [
                'company_name' => $settings['company_name']->value ?? '',
                'logo_url' => isset($settings['logo']) && $settings['logo']->value
                    ? Storage::url($settings['logo']->value)
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
        ]);

        // Update or create company_name
        Setting::updateOrCreate(
            ['name' => 'company_name'],
            ['value' => $request->company_name]
        );

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');

            // Delete old logo if exists
            $oldLogo = Setting::where('name', 'logo')->first();
            if ($oldLogo && $oldLogo->value && Storage::disk('public')->exists($oldLogo->value)) {
                Storage::disk('public')->delete($oldLogo->value);
            }

            // Generate unique filename with timestamp
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('logos', $filename, 'public');

            Setting::updateOrCreate(
                ['name' => 'logo'],
                ['value' => $path]
            );
        }

        // Redirect back with a flash message (valid Inertia response)
        return redirect()->route('settings.index')->with('success', 'Settings updated successfully.');
    }
}
