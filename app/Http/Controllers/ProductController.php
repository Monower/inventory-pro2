<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Display a listing of the products
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $products = Product::with(['subCategory', 'attributeValue'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('selling_price', 'like', "%{$q}%")
                        ->orWhere('stock', 'like', "%{$q}%")
                        ->orWhereHas('subCategory', function ($categoryQuery) use ($q) {
                            $categoryQuery->where('name', 'like', "%{$q}%");
                        })
                        ->orWhereHas('attributeValue', function ($attributeQuery) use ($q) {
                            $attributeQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    // Show the form for creating a new product
    public function create()
    {
        $categories = Category::query()
            ->select('id', 'name')
            ->with(['subCategories:id,category_id,name'])
            ->orderBy('name')
            ->get();
        $attributes = Attribute::query()
            ->select('id', 'name')
            ->with(['values:id,attribute_id,name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('products/create', [
            'categories' => $categories,
            'attributes' => $attributes,
            'productUnits' => Setting::getProductUnits(),
        ]);
    }

    // Store a newly created product in storage
    public function store(Request $request)
    {
        $productUnits = Setting::getProductUnits();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'selling_price' => 'required|numeric|min:0',
            'buying_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => ['required', 'string', 'max:50', Rule::in($productUnits)],
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

    // Display the specified product
    public function show(Product $product)
    {
        return Inertia::render('products/show', [
            'product' => $product->load(['subCategory.category', 'attributeValue.attribute']),
        ]);
    }

    // Show the form for editing the specified product
    public function edit(Product $product)
    {
        $categories = Category::query()
            ->select('id', 'name')
            ->with(['subCategories:id,category_id,name'])
            ->orderBy('name')
            ->get();
        $attributes = Attribute::query()
            ->select('id', 'name')
            ->with(['values:id,attribute_id,name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('products/edit', [
            'product' => $product->load('attributeValue'),
            'categories' => $categories,
            'attributes' => $attributes,
            'productUnits' => Setting::getProductUnits(),
        ]);
    }

    // Update the specified product in storage
    public function update(Request $request, Product $product)
    {
        $productUnits = Setting::getProductUnits();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'selling_price' => 'required|numeric|min:0',
            'buying_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => ['required', 'string', 'max:50', Rule::in($productUnits)],
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
    public function destroy($id)
    {

        $product = Product::findOrFail($id);

        if($product){
            if ($product->product_image) {
                Storage::disk('public')->delete($product->product_image);
            }
            $product->delete();

            return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
        } else {
            return redirect()->route('products.index')->with('error', 'Product not found.');
        }
    }
}
