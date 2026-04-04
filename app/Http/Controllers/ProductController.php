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
            'stock' => 'nullable|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
            'attribute_stocks' => 'nullable|array',
            'attribute_stocks.*.attribute_value_id' => 'required|exists:attribute_values,id',
            'attribute_stocks.*.buying_price' => 'nullable|numeric|min:0',
            'attribute_stocks.*.selling_price' => 'nullable|numeric|min:0',
            'attribute_stocks.*.stock' => 'required|integer|min:0',
        ]);

        $this->validateStockPayload($validated, $request);

        if ($request->hasFile('product_image')) {
            $path = $request->file('product_image')->store('product_images', 'public');
            $validated['product_image'] = $path;
        }

        $product = Product::create([
            'name' => $validated['name'],
            'selling_price' => $validated['selling_price'],
            'buying_price' => $validated['buying_price'],
            'stock' => 0,
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? null,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => null,
        ]);

        $this->syncProductVariants($product, $validated);

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    // Display the specified product
    public function show(Product $product)
    {
        return Inertia::render('products/show', [
            'product' => $product->load(['subCategory.category', 'attributeValue.attribute', 'variants.attributeValue.attribute']),
        ]);
    }

    // Show the form for editing the specified product
    public function edit(Product $product)
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('products/edit', [
            'product' => $product->load(['subCategory.category', 'attributeValue.attribute', 'variants.attributeValue.attribute']),
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
            'stock' => 'nullable|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'product_image' => 'nullable|image|max:2048',
            'sub_category_id' => 'required|exists:sub_categories,id',
            'attribute_id' => 'nullable|exists:attributes,id',
            'attribute_stocks' => 'nullable|array',
            'attribute_stocks.*.attribute_value_id' => 'required|exists:attribute_values,id',
            'attribute_stocks.*.buying_price' => 'nullable|numeric|min:0',
            'attribute_stocks.*.selling_price' => 'nullable|numeric|min:0',
            'attribute_stocks.*.stock' => 'required|integer|min:0',
        ]);

        $this->validateStockPayload($validated, $request);

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
            'stock' => $product->stock,
            'unit' => $validated['unit'],
            'description' => $validated['description'] ?? null,
            'product_image' => $validated['product_image'] ?? $product->product_image,
            'sub_category_id' => $validated['sub_category_id'],
            'attribute_value_id' => null,
        ]);

        $this->syncProductVariants($product, $validated);

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

    protected function validateStockPayload(array $validated, Request $request): void
    {
        $hasAttribute = !empty($validated['attribute_id']);
        $attributeStocks = collect($validated['attribute_stocks'] ?? [])
            ->filter(fn ($item) => isset($item['attribute_value_id']))
            ->values();

        if ($hasAttribute && $attributeStocks->isEmpty()) {
            $request->validate([
                'attribute_stocks' => 'required|array|min:1',
            ]);
        }

        if (!$hasAttribute && !isset($validated['stock'])) {
            $request->validate([
                'stock' => 'required|integer|min:0',
            ]);
        }

        if ($hasAttribute && $attributeStocks->isNotEmpty()) {
            $invalidValueExists = AttributeValue::query()
                ->whereIn('id', $attributeStocks->pluck('attribute_value_id'))
                ->where('attribute_id', '!=', $validated['attribute_id'])
                ->exists();

            if ($invalidValueExists) {
                $request->validate([
                    'attribute_stocks' => 'prohibited',
                ], [
                    'attribute_stocks.prohibited' => 'Selected attribute values do not match the chosen attribute.',
                ]);
            }
        }
    }

    protected function syncProductVariants(Product $product, array $validated): void
    {
        $attributeStocks = collect($validated['attribute_stocks'] ?? [])
            ->map(fn ($item) => [
                'attribute_value_id' => $item['attribute_value_id'],
                'buying_price' => $item['buying_price'] ?? null,
                'average_cost' => $item['buying_price'] ?? null,
                'selling_price' => $item['selling_price'] ?? null,
                'stock' => (int) $item['stock'],
            ])
            ->unique('attribute_value_id')
            ->values();

        $product->variants()->delete();

        if ($attributeStocks->isNotEmpty()) {
            foreach ($attributeStocks as $variant) {
                $product->variants()->create($variant);
            }
        } else {
            $product->variants()->create([
                'attribute_value_id' => null,
                'buying_price' => $validated['buying_price'],
                'average_cost' => $validated['buying_price'],
                'selling_price' => $validated['selling_price'],
                'stock' => (int) ($validated['stock'] ?? 0),
            ]);
        }

        $product->syncStockFromVariants();
    }
}
