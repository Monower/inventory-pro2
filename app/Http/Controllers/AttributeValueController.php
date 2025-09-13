<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributeValueController extends Controller
{
    public function index()
    {
        $values = \App\Models\AttributeValue::with('attribute')->latest()->get();
        $attributes = \App\Models\Attribute::all();

        return \Inertia\Inertia::render('attributeValue/index', [
            'values' => $values,
            'attributes' => $attributes,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
        ]);

        AttributeValue::create($validated);

        return redirect()->route('attributeValues.index')
            ->with('success', 'Attribute value created successfully.');
    }

    public function update(Request $request, AttributeValue $attributeValue)
    {
        $validated = $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255',
        ]);

        $attributeValue->update($validated);

        return redirect()->route('attributeValues.index')
            ->with('success', 'Attribute value updated successfully.');
    }

    public function destroy(AttributeValue $attributeValue)
    {
        $attributeValue->delete();

        return redirect()->route('attributeValues.index')
            ->with('success', 'Attribute value deleted successfully.');
    }
}
