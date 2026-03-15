<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributeValueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        return Inertia::render('attributeValue/index', [
            'values' => AttributeValue::with('attribute')
                ->when($q !== '', function ($query) use ($q) {
                    $query->where(function ($subQuery) use ($q) {
                        $subQuery->where('name', 'like', "%{$q}%")
                            ->orWhereHas('attribute', function ($attributeQuery) use ($q) {
                                $attributeQuery->where('name', 'like', "%{$q}%");
                            });
                    });
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
            'attributes' => Attribute::query()->select('id', 'name')->orderBy('name')->get(),
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
        ]);

        AttributeValue::create([
            'attribute_id' => $validated['attribute_id'],
            'name' => $validated['value'],
        ]);

        return redirect()->route('attributeValues.index')->with('success', 'Attribute value created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttributeValue $attributeValue)
    {
        $validated = $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
        ]);

        $attributeValue->update([
            'attribute_id' => $validated['attribute_id'],
            'name' => $validated['value'],
        ]);

        return redirect()->route('attributeValues.index')->with('success', 'Attribute value updated successfully.');
    }

    public function destroy(AttributeValue $attributeValue)
    {
        $attributeValue->delete();

        return redirect()->route('attributeValues.index')->with('success', 'Attribute value deleted successfully.');
    }
}
