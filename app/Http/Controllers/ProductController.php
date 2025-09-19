<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Display a listing of the products
    public function index()
    {
        $products = Product::with(['subCategory', 'attributeValue'])->paginate(10);
        return Inertia::render('products/index', [
            'products' => $products,
        ]);
    }

    // Show the form for creating a new product
    public function create()
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('products/create', [
            'categories' => $categories,
            'attributes' => $attributes,
        ]);
    }

    // Store a newly created product in storage
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'selling_price' => 'required|numeric|min:0',
            'buying_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
            'attribute_value_ids' => 'nullable|array',
            'attribute_value_ids.*' => 'exists:attribute_values,id',
        ]);

        if ($request->hasFile('product_image')) {
            $path = $request->file('product_image')->store('product_images', 'public');
            $validated['product_image'] = $path;
        }

        $product = Product::create([
            'name' => $validated['name'],
            'selling_price' => $validated['selling_price'],
            'buying_price' => $validated['buying_price'],
            'stock' => $validated['stock'],
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? null,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => $validated['attribute_value_ids'][0] ?? null,
        ]);

        // You can handle attaching multiple attribute values if needed here

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    // Show the form for editing the specified product
    public function edit(Product $product)
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('products/edit', [
            'product' => $product->load('attributeValue'),
            'categories' => $categories,
            'attributes' => $attributes,
        ]);
    }

    // Update the specified product in storage
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'selling_price' => 'required|numeric|min:0',
            'buying_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
            'attribute_value_ids' => 'nullable|array',
            'attribute_value_ids.*' => 'exists:attribute_values,id',
        ]);

        if ($request->hasFile('product_image')) {
            if ($product->product_image) {
                Storage::disk('public')->delete($product->product_image);
            }
            $path = $request->file('product_image')->store('product_images', 'public');
            $validated['product_image'] = $path;
        }

        $product->update([
            'name' => $validated['name'],
            'selling_price' => $validated['selling_price'],
            'buying_price' => $validated['buying_price'],
            'stock' => $validated['stock'],
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? $product->product_image,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => $validated['attribute_value_ids'][0] ?? null,
        ]);

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    // Remove the specified product from storage
    public function destroy(Product $product)
    {
        if ($product->product_image) {
            Storage::disk('public')->delete($product->product_image);
        }
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }
}
