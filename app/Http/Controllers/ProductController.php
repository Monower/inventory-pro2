<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Display a listing of the products
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $products = Product::with(['subCategory', 'attribute', 'variants'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhereHas('subCategory', function ($categoryQuery) use ($q) {
                            $categoryQuery->where('name', 'like', "%{$q}%");
                        })
                        ->orWhereHas('attribute', function ($attributeQuery) use ($q) {
                            $attributeQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Products/index', [
            'products' => $products,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    // Show the form for creating a new product
    public function create()
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('Products/create', [
            'categories' => $categories,
            'attributes' => $attributes,
        ]);
    }

    // Store a newly created product in storage
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
        ]);

        if ($request->hasFile('product_image')) {
            $path = $request->file('product_image')->store('product_images', 'public');
            $validated['product_image'] = $path;
        }

        $productData = [
            'name' => $validated['name'],
            'selling_price' => 0,
            'buying_price' => 0,
            'stock' => 0,
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? null,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => null,
        ];

        if (Schema::hasColumn('products', 'attribute_id')) {
            $productData['attribute_id'] = $validated['attribute_id'] ?? null;
        }

        Product::create($productData);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    // Display the specified product
    public function show(Product $product)
    {
        return Inertia::render('Products/show', [
            'product' => $product->load(['subCategory.category', 'attribute', 'variants.attributeValue.attribute']),
        ]);
    }

    // Show the form for editing the specified product
    public function edit(Product $product)
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('Products/edit', [
            'product' => $product->load(['subCategory.category', 'attribute', 'variants.attributeValue.attribute']),
            'categories' => $categories,
            'attributes' => $attributes,
        ]);
    }

    // Update the specified product in storage
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
        ]);

        if (
            Schema::hasColumn('products', 'attribute_id') &&
            $product->variants()->exists() &&
            (int) ($validated['attribute_id'] ?? 0) !== (int) ($product->attribute_id ?? 0)
        ) {
            throw ValidationException::withMessages([
                'attribute_id' => 'You cannot change the product attribute after pricing rows have been created. Update product prices first or keep the existing attribute.',
            ]);
        }

        if ($request->hasFile('product_image')) {
            if ($product->product_image) {
                Storage::disk('public')->delete($product->product_image);
            }
            $path = $request->file('product_image')->store('product_images', 'public');
            $validated['product_image'] = $path;
        }

        $productData = [
            'name' => $validated['name'],
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? $product->product_image,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => null,
        ];

        if (Schema::hasColumn('products', 'attribute_id')) {
            $productData['attribute_id'] = $validated['attribute_id'] ?? null;
        }

        $product->update($productData);

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
