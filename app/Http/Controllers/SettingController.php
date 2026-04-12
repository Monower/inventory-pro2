<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Attribute;
use App\Models\Unit;
use App\Support\CurrentTenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

    public function attributes()
    {
        $attributes = Attribute::query()
            ->latest()
            ->paginate(10)
            ->through(fn (Attribute $attribute) => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'values' => $attribute->values ?: [],
                'status' => $attribute->is_active ? 'Active' : 'Inactive',
                'is_active' => $attribute->is_active,
            ]);

        return Inertia::render('settings/Attributes', [
            'attributes' => $attributes,
        ]);
    }

    public function storeAttribute(Request $request)
    {
        $tenantId = app(CurrentTenant::class)->id();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('attributes', 'name')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'values' => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ]);

        Attribute::create([
            'name' => $validated['name'],
            'values' => array_values(array_unique($validated['values'] ?? [])),
            'is_active' => $validated['is_active'],
        ]);

        return redirect()
            ->route('settings.attributes')
            ->with('success', 'Attribute created successfully.');
    }

    public function updateAttribute(Request $request, Attribute $attribute)
    {
        $tenantId = app(CurrentTenant::class)->id();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('attributes', 'name')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->ignore($attribute->id),
            ],
            'values' => ['nullable', 'array'],
            'values.*' => ['required', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ]);

        $attribute->update([
            'name' => $validated['name'],
            'values' => array_values(array_unique($validated['values'] ?? [])),
            'is_active' => $validated['is_active'],
        ]);

        return redirect()
            ->route('settings.attributes')
            ->with('success', 'Attribute updated successfully.');
    }

    public function destroyAttribute(Attribute $attribute)
    {
        $attribute->delete();

        return redirect()
            ->route('settings.attributes')
            ->with('success', 'Attribute deleted successfully.');
    }

    public function units()
    {
        $units = Unit::query()
            ->latest()
            ->paginate(10)
            ->through(fn (Unit $unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'symbol' => $unit->symbol,
                'status' => $unit->is_active ? 'Active' : 'Inactive',
                'is_active' => $unit->is_active,
            ]);

        return Inertia::render('settings/Units', [
            'units' => $units,
        ]);
    }

    public function storeUnit(Request $request)
    {
        $tenantId = app(CurrentTenant::class)->id();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'name')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'symbol' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ]);

        Unit::create($validated);

        return redirect()
            ->route('settings.units')
            ->with('success', 'Unit created successfully.');
    }

    public function updateUnit(Request $request, Unit $unit)
    {
        $tenantId = app(CurrentTenant::class)->id();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'name')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->ignore($unit->id),
            ],
            'symbol' => ['nullable', 'string', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ]);

        $unit->update($validated);

        return redirect()
            ->route('settings.units')
            ->with('success', 'Unit updated successfully.');
    }

    public function destroyUnit(Unit $unit)
    {
        $unit->delete();

        return redirect()
            ->route('settings.units')
            ->with('success', 'Unit deleted successfully.');
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
