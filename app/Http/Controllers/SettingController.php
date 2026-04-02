<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Support\CurrentTenant;
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
        $settings = Setting::whereIn('name', [
            'company_name',
            'company_address',
            'company_phone',
            'receipt_footer',
            'logo',
        ])->get()->keyBy('name');

        return Inertia::render('settings/index', [
            'settings' => [
                'company_name' => $settings['company_name']->value ?? '',
                'company_address' => $settings['company_address']->value ?? '',
                'company_phone' => $settings['company_phone']->value ?? '',
                'receipt_footer' => $settings['receipt_footer']->value ?? '',
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
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_address' => 'nullable|string|max:255',
            'company_phone' => 'nullable|string|max:50',
            'receipt_footer' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048',
        ]);

        $tenantId = app(CurrentTenant::class)->id();

        Setting::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'company_name'],
            ['value' => $request->company_name]
        );

        Setting::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'company_address'],
            ['value' => $request->company_address ?? '']
        );

        Setting::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'company_phone'],
            ['value' => $request->company_phone ?? '']
        );

        Setting::updateOrCreate(
            ['tenant_id' => $tenantId, 'name' => 'receipt_footer'],
            ['value' => $request->receipt_footer ?? '']
        );

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');

            $oldLogo = Setting::where('tenant_id', $tenantId)->where('name', 'logo')->first();
            if ($oldLogo && $oldLogo->value && Storage::disk('public')->exists($oldLogo->value)) {
                Storage::disk('public')->delete($oldLogo->value);
            }

            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('logos', $filename, 'public');

            Setting::updateOrCreate(
                ['tenant_id' => $tenantId, 'name' => 'logo'],
                ['value' => $path]
            );
        }

        return redirect()->route('settings.index')->with('success', 'Settings updated successfully.');
    }
}
