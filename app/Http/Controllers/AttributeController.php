<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AttributeController extends Controller
{
    // List all attributes with their values
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $attributes = Attribute::with('values')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhereHas('values', function ($valueQuery) use ($q) {
                            $valueQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('attributes/index', [
            'attributes' => $attributes,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    // Show form to create new attribute
    public function create()
    {
        return Inertia::render('attributes/create');
    }

    // Store a new attribute along with its values
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('attributes', 'name')->where('tenant_id', $tenantId)],
            'values' => 'nullable|array',
            'values.*' => 'required|string|max:255',
        ]);

        $attribute = Attribute::create([
            'name' => $validated['name'],
        ]);

        if (!empty($validated['values'])) {
            foreach ($validated['values'] as $value) {
                $attribute->values()->create(['name' => $value]);
            }
        }

        return redirect()->route('attributes.index')->with('success', 'Attribute created successfully.');
    }

    // Show form to edit attribute and values
    public function edit(Attribute $attribute)
    {
        $attribute->load('values');
        return Inertia::render('attributes/edit', ['attribute' => $attribute]);
    }

    // Update attribute and its values
    public function update(Request $request, Attribute $attribute)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('attributes', 'name')->where('tenant_id', $tenantId)->ignore($attribute->id)],
            'values' => 'nullable|array',
            'values.*.id' => 'nullable|exists:attribute_values,id',
            'values.*.name' => 'required|string|max:255',
        ]);

        $attribute->update(['name' => $validated['name']]);

        $existingValueIds = $attribute->values()->pluck('id')->toArray();
        $submittedValueIds = array_filter(array_column($validated['values'] ?? [], 'id'));

        // Delete removed values
        $toDelete = array_diff($existingValueIds, $submittedValueIds);
        if ($toDelete) {
            AttributeValue::destroy($toDelete);
        }

        // Update or create values
        foreach ($validated['values'] ?? [] as $val) {
            if (!empty($val['id'])) {
                // Update existing
                $attributeValue = AttributeValue::find($val['id']);
                $attributeValue->update(['name' => $val['name']]);
            } else {
                // New value
                $attribute->values()->create(['name' => $val['name']]);
            }
        }

        return redirect()->route('attributes.index')->with('success', 'Attribute updated successfully.');
    }

    // Delete attribute and its values (cascade)
    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return redirect()->route('attributes.index')->with('success', 'Attribute deleted successfully.');
    }
}
