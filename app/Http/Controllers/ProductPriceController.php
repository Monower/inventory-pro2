<?php

namespace App\Http\Controllers;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductPriceController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $products = Product::with([
            'subCategory',
            'attribute',
            'variants.attributeValue.attribute',
        ])
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

        return Inertia::render('product-prices/index', [
            'products' => $products,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        $selectedProductId = (int) request()->query('product');

        $products = Product::with(['subCategory', 'attribute.values'])
            ->whereDoesntHave('variants')
            ->latest()
            ->get();

        return Inertia::render('product-prices/create', [
            'products' => $products,
            'selectedProductId' => $selectedProductId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'selling_price' => 'nullable|numeric|min:0',
            'buying_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'attribute_stocks' => 'nullable|array',
            'attribute_stocks.*.attribute_value_id' => 'required|exists:attribute_values,id',
            'attribute_stocks.*.buying_price' => 'required|numeric|min:0',
            'attribute_stocks.*.selling_price' => 'required|numeric|min:0',
            'attribute_stocks.*.stock' => 'required|integer|min:0',
        ]);

        $product = Product::with(['attribute.values', 'variants'])->findOrFail($validated['product_id']);

        if ($product->variants()->exists()) {
            return redirect()
                ->route('product-prices.edit', $product)
                ->with('error', 'Pricing already exists for this product.');
        }

        $this->validatePricePayload($product, $validated, $request);
        $this->syncProductVariants($product, $validated);

        return redirect()->route('product-prices.index')->with('success', 'Product pricing created successfully.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('product-prices/edit', [
            'product' => $product->load([
                'subCategory',
                'attribute.values',
                'variants.attributeValue.attribute',
            ]),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'selling_price' => 'nullable|numeric|min:0',
            'buying_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'attribute_stocks' => 'nullable|array',
            'attribute_stocks.*.attribute_value_id' => 'required|exists:attribute_values,id',
            'attribute_stocks.*.buying_price' => 'required|numeric|min:0',
            'attribute_stocks.*.selling_price' => 'required|numeric|min:0',
            'attribute_stocks.*.stock' => 'required|integer|min:0',
        ]);

        $product->load(['attribute.values', 'variants.orderItems', 'variants.purchaseItems']);

        $this->validatePricePayload($product, $validated, $request);
        $this->syncProductVariants($product, $validated);

        return redirect()->route('product-prices.index')->with('success', 'Product pricing updated successfully.');
    }

    protected function validatePricePayload(Product $product, array $validated, Request $request): void
    {
        $attributeId = $product->attribute_id;
        $attributeStocks = collect($validated['attribute_stocks'] ?? [])
            ->filter(fn ($item) => isset($item['attribute_value_id']))
            ->values();

        if ($attributeId) {
            if ($attributeStocks->isEmpty()) {
                $request->validate([
                    'attribute_stocks' => 'required|array|min:1',
                ], [
                    'attribute_stocks.required' => 'Add at least one attribute value price row.',
                ]);
            }

            $invalidValueExists = AttributeValue::query()
                ->whereIn('id', $attributeStocks->pluck('attribute_value_id'))
                ->where('attribute_id', '!=', $attributeId)
                ->exists();

            if ($invalidValueExists) {
                throw ValidationException::withMessages([
                    'attribute_stocks' => 'Selected attribute values do not match the product attribute.',
                ]);
            }

            return;
        }

        $request->validate([
            'selling_price' => 'required|numeric|min:0',
            'buying_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);
    }

    protected function syncProductVariants(Product $product, array $validated): void
    {
        $desiredVariants = collect($validated['attribute_stocks'] ?? [])
            ->map(fn ($item) => [
                'attribute_value_id' => (int) $item['attribute_value_id'],
                'buying_price' => (float) $item['buying_price'],
                'average_cost' => (float) $item['buying_price'],
                'selling_price' => (float) $item['selling_price'],
                'stock' => (int) $item['stock'],
            ])
            ->unique('attribute_value_id')
            ->values();

        if ($product->attribute_id && $desiredVariants->isNotEmpty()) {
            $this->upsertVariants($product, $desiredVariants);
            $product->syncStockFromVariants();
            return;
        }

        $baseVariantData = [
            'attribute_value_id' => null,
            'buying_price' => (float) $validated['buying_price'],
            'average_cost' => (float) $validated['buying_price'],
            'selling_price' => (float) $validated['selling_price'],
            'stock' => (int) $validated['stock'],
        ];

        $this->upsertVariants($product, collect([$baseVariantData]));
        $product->syncStockFromVariants();
    }

    protected function upsertVariants(Product $product, $desiredVariants): void
    {
        $existingVariants = $product->variants()->get()->keyBy(function ($variant) {
            return $variant->attribute_value_id === null
                ? 'base'
                : (string) $variant->attribute_value_id;
        });

        $desiredKeys = [];

        foreach ($desiredVariants as $variantData) {
            $key = $variantData['attribute_value_id'] === null
                ? 'base'
                : (string) $variantData['attribute_value_id'];

            $desiredKeys[] = $key;
            $existingVariant = $existingVariants->get($key);

            if ($existingVariant) {
                $existingVariant->update($variantData);
                continue;
            }

            $product->variants()->create($variantData);
        }

        $variantsToDelete = $existingVariants
            ->except($desiredKeys)
            ->values();

        foreach ($variantsToDelete as $variant) {
            if ($variant->orderItems()->exists() || $variant->purchaseItems()->exists()) {
                $label = $variant->attributeValue?->name ?? 'standard';

                throw ValidationException::withMessages([
                    'attribute_stocks' => "Cannot remove the {$label} variant because it is already used in transactions.",
                ]);
            }

            $variant->delete();
        }
    }
}
