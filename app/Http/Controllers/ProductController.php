<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Support\CurrentTenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'category_id' => $request->input('category_id', ''),
            'sub_category_id' => $request->input('sub_category_id', ''),
            'status' => $request->input('status', 'all'),
        ];

        $products = Product::query()
            ->with(['category', 'subCategory', 'unit', 'variants'])
            ->withCount('variants')
            ->when($filters['q'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('variants', function ($query) use ($search): void {
                            $query
                                ->where('sku', 'like', "%{$search}%")
                                ->orWhere('barcode', 'like', "%{$search}%")
                                ->orWhere('variant_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['category_id'], fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['sub_category_id'], fn ($query, $subCategoryId) => $query->where('sub_category_id', $subCategoryId))
            ->when($filters['status'] !== 'all', fn ($query) => $query->where('is_active', $filters['status'] === 'active'))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Product $product) => $this->productPayload($product));

        return Inertia::render('Products/ProductList/Index', [
            'products' => $products,
            'filters' => $filters,
            'categories' => $this->categoryOptions(),
            'units' => $this->unitOptions(),
        ]);
    }

    public function createProduct()
    {
        return Inertia::render('Products/ProductList/Create', [
            'categories' => $this->categoryOptions(),
            'units' => $this->unitOptions(),
            'attributes' => Attribute::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Attribute $attribute) => [
                    'id' => $attribute->id,
                    'name' => $attribute->name,
                    'values' => $attribute->values ?: [],
                ]),
        ]);
    }

    public function storeProduct(Request $request)
    {
        $tenantId = app(CurrentTenant::class)->id();
        $slug = Str::slug($request->input('slug') ?: $request->input('name'));

        $request->merge([
            'slug' => $slug,
            'has_variants' => $request->boolean('has_variants'),
            'is_active' => $request->boolean('is_active'),
            'variants' => collect($request->input('variants', []))
                ->map(fn (array $variant) => array_merge($variant, [
                    'is_active' => filter_var($variant['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                ]))
                ->values()
                ->all(),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'description' => ['nullable', 'string'],
            'unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId))],
            'base_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'vat' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('parent_id'))],
            'sub_category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId))],
            'primary_image' => ['nullable', 'image', 'max:2048'],
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['image', 'max:2048'],
            'is_active' => ['required', 'boolean'],
            'has_variants' => ['required', 'boolean'],
            'sku' => ['nullable', 'string', 'max:255'],
            'stock' => ['nullable', 'numeric', 'min:0'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'variants' => ['nullable', 'array'],
            'variants.*.variant_name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.sku' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.cost_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['nullable', 'numeric', 'min:0'],
            'variants.*.barcode' => ['nullable', 'string', 'max:255'],
            'variants.*.is_active' => ['required_with:variants', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            $primaryImagePath = $request->hasFile('primary_image')
                ? $request->file('primary_image')->store('products', 'public')
                : null;

            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'unit_id' => $validated['unit_id'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'sub_category_id' => $validated['sub_category_id'] ?? null,
                'image_path' => $primaryImagePath,
                'base_price' => $validated['base_price'],
                'cost_price' => $validated['cost_price'] ?? 0,
                'vat' => $validated['vat'] ?? 0,
                'has_variants' => $validated['has_variants'],
                'sku' => $validated['has_variants'] ? null : ($validated['sku'] ?? null),
                'stock' => $validated['has_variants'] ? 0 : ($validated['stock'] ?? 0),
                'barcode' => $validated['has_variants'] ? null : ($validated['barcode'] ?? null),
                'is_active' => $validated['is_active'],
            ]);

            foreach ($request->file('additional_images', []) as $index => $image) {
                $product->images()->create([
                    'image_path' => $image->store('products', 'public'),
                    'sort_order' => $index,
                ]);
            }

            if ($validated['has_variants']) {
                foreach ($validated['variants'] ?? [] as $variant) {
                    $product->variants()->create([
                        'variant_name' => $variant['variant_name'],
                        'sku' => $variant['sku'] ?? null,
                        'price' => $variant['price'] ?? $validated['base_price'],
                        'cost_price' => $variant['cost_price'] ?? ($validated['cost_price'] ?? 0),
                        'stock' => $variant['stock'] ?? 0,
                        'barcode' => $variant['barcode'] ?? null,
                        'is_active' => $variant['is_active'],
                    ]);
                }
            } else {
                $product->variants()->create([
                    'variant_name' => 'Default',
                    'sku' => $validated['sku'] ?? null,
                    'price' => $validated['base_price'],
                    'cost_price' => $validated['cost_price'] ?? 0,
                    'stock' => $validated['stock'] ?? 0,
                    'barcode' => $validated['barcode'] ?? null,
                    'is_active' => true,
                ]);
            }
        });

        return redirect()
            ->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    public function editProduct(Product $product)
    {
        $product->load(['variants', 'images']);

        return Inertia::render('Products/ProductList/Edit', [
            'product' => $this->productFormPayload($product),
            'categories' => $this->categoryOptions(),
            'units' => $this->unitOptions(),
            'attributes' => Attribute::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Attribute $attribute) => [
                    'id' => $attribute->id,
                    'name' => $attribute->name,
                    'values' => $attribute->values ?: [],
                ]),
        ]);
    }

    public function showProduct(Product $product)
    {
        $product->load(['category', 'subCategory', 'unit', 'variants', 'images']);

        return Inertia::render('Products/ProductList/Show', [
            'product' => $this->productDetailPayload($product),
        ]);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $tenantId = app(CurrentTenant::class)->id();
        $slug = Str::slug($request->input('slug') ?: $request->input('name'));

        $request->merge([
            'slug' => $slug,
            'has_variants' => $request->boolean('has_variants'),
            'is_active' => $request->boolean('is_active'),
            'variants' => collect($request->input('variants', []))
                ->map(fn (array $variant) => array_merge($variant, [
                    'is_active' => filter_var($variant['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                ]))
                ->values()
                ->all(),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->ignore($product->id),
            ],
            'description' => ['nullable', 'string'],
            'unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId))],
            'base_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'vat' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)->whereNull('parent_id'))],
            'sub_category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId))],
            'primary_image' => ['nullable', 'image', 'max:2048'],
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['image', 'max:2048'],
            'is_active' => ['required', 'boolean'],
            'has_variants' => ['required', 'boolean'],
            'sku' => ['nullable', 'string', 'max:255'],
            'stock' => ['nullable', 'numeric', 'min:0'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.variant_name' => ['required_with:variants', 'string', 'max:255'],
            'variants.*.sku' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.cost_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['nullable', 'numeric', 'min:0'],
            'variants.*.barcode' => ['nullable', 'string', 'max:255'],
            'variants.*.is_active' => ['required_with:variants', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $validated, $product): void {
            $primaryImagePath = $product->image_path;

            if ($request->hasFile('primary_image')) {
                if ($primaryImagePath) {
                    Storage::disk('public')->delete($primaryImagePath);
                }

                $primaryImagePath = $request->file('primary_image')->store('products', 'public');
            }

            $product->update([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'unit_id' => $validated['unit_id'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'sub_category_id' => $validated['sub_category_id'] ?? null,
                'image_path' => $primaryImagePath,
                'base_price' => $validated['base_price'],
                'cost_price' => $validated['cost_price'] ?? 0,
                'vat' => $validated['vat'] ?? 0,
                'has_variants' => $validated['has_variants'],
                'sku' => $validated['has_variants'] ? null : ($validated['sku'] ?? null),
                'stock' => $validated['has_variants'] ? 0 : ($validated['stock'] ?? 0),
                'barcode' => $validated['has_variants'] ? null : ($validated['barcode'] ?? null),
                'is_active' => $validated['is_active'],
            ]);

            foreach ($request->file('additional_images', []) as $index => $image) {
                $product->images()->create([
                    'image_path' => $image->store('products', 'public'),
                    'sort_order' => $product->images()->count() + $index,
                ]);
            }

            if ($validated['has_variants']) {
                $keptVariantIds = collect($validated['variants'] ?? [])
                    ->pluck('id')
                    ->filter()
                    ->all();

                if ($keptVariantIds) {
                    $product->variants()->whereNotIn('id', $keptVariantIds)->delete();
                } else {
                    $product->variants()->delete();
                }

                foreach ($validated['variants'] ?? [] as $variant) {
                    $values = [
                            'variant_name' => $variant['variant_name'],
                            'sku' => $variant['sku'] ?? null,
                            'price' => $variant['price'] ?? $validated['base_price'],
                            'cost_price' => $variant['cost_price'] ?? ($validated['cost_price'] ?? 0),
                            'stock' => $variant['stock'] ?? 0,
                            'barcode' => $variant['barcode'] ?? null,
                            'is_active' => $variant['is_active'],
                    ];

                    if (!empty($variant['id'])) {
                        $product->variants()->whereKey($variant['id'])->update($values);
                    } else {
                        $product->variants()->create($values);
                    }
                }
            } else {
                $product->variants()->delete();
                $product->variants()->create([
                    'variant_name' => 'Default',
                    'sku' => $validated['sku'] ?? null,
                    'price' => $validated['base_price'],
                    'cost_price' => $validated['cost_price'] ?? 0,
                    'stock' => $validated['stock'] ?? 0,
                    'barcode' => $validated['barcode'] ?? null,
                    'is_active' => true,
                ]);
            }
        });

        return redirect()
            ->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function categories()
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->with([
                'subCategories' => fn ($query) => $query
                    ->withCount('subCategoryProducts')
                    ->latest(),
            ])
            ->withCount(['subCategories', 'products'])
            ->latest()
            ->paginate(10)
            ->through(fn (Category $category) => $this->categoryPayload($category));

        return Inertia::render('Products/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function createCategory()
    {
        return Inertia::render('Products/Categories/Create');
    }

    public function storeCategory(Request $request)
    {
        $tenantId = app(CurrentTenant::class)->id();
        $slug = Str::slug($request->input('slug') ?: $request->input('name'));

        $request->merge([
            'slug' => $slug,
            'is_active' => $request->boolean('is_active'),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['required', 'boolean'],
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId))],
        ]);

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('categories', 'public')
            : null;

        Category::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'is_active' => $validated['is_active'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        return (isset($validated['parent_id'])
            ? redirect()->back()
            : redirect()->route('products.categories'))
            ->with('success', 'Category created successfully.');
    }

    public function editCategory(Category $category)
    {
        $category->load([
            'subCategories' => fn ($query) => $query->latest(),
        ])->loadCount('subCategories');

        return Inertia::render('Products/Categories/Edit', [
            'category' => $this->categoryPayload($category),
        ]);
    }

    public function updateCategory(Request $request, Category $category)
    {
        $tenantId = app(CurrentTenant::class)->id();
        $slug = Str::slug($request->input('slug') ?: $request->input('name'));

        $request->merge([
            'slug' => $slug,
            'is_active' => $request->boolean('is_active'),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->ignore($category->id),
            ],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['required', 'boolean'],
        ]);

        $imagePath = $category->image_path;

        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $category->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath,
            'is_active' => $validated['is_active'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Category updated successfully.');
    }

    public function destroyCategory(Category $category)
    {
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return redirect()
            ->back()
            ->with('success', 'Category deleted successfully.');
    }

    protected function categoryPayload(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image_url' => $category->image_url,
            'parent_id' => $category->parent_id,
            'sub_categories_count' => $category->sub_categories_count,
            'products_count' => $category->products_count ?? 0,
            'status' => $category->is_active ? 'Active' : 'Inactive',
            'sub_categories' => $category->subCategories
                ->map(fn (Category $subCategory) => [
                    'id' => $subCategory->id,
                    'name' => $subCategory->name,
                    'slug' => $subCategory->slug,
                    'description' => $subCategory->description,
                    'image_url' => $subCategory->image_url,
                    'parent_id' => $subCategory->parent_id,
                    'products_count' => $subCategory->sub_category_products_count ?? 0,
                    'status' => $subCategory->is_active ? 'Active' : 'Inactive',
                ])
                ->values(),
        ];
    }

    public function destroyProduct(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return redirect()
            ->back()
            ->with('success', 'Product deleted successfully.');
    }

    protected function productPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'image_url' => $product->image_url,
            'category' => $product->category?->name,
            'sub_category' => $product->subCategory?->name,
            'unit' => $product->unit
                ? trim("{$product->unit->name} {$product->unit->symbol}")
                : null,
            'base_price' => number_format((float) $product->base_price, 2),
            'variants_count' => $product->variants_count,
            'status' => $product->is_active ? 'Active' : 'Inactive',
            'variants' => $product->variants
                ->map(fn ($variant) => [
                    'id' => $variant->id,
                    'variant_name' => $variant->variant_name,
                    'sku' => $variant->sku,
                    'price' => number_format((float) $variant->price, 2),
                    'cost_price' => number_format((float) $variant->cost_price, 2),
                    'stock' => number_format((float) $variant->stock, 2),
                    'barcode' => $variant->barcode,
                    'status' => $variant->is_active ? 'Active' : 'Inactive',
                ])
                ->values(),
        ];
    }

    protected function productFormPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'unit_id' => $product->unit_id,
            'base_price' => (string) $product->base_price,
            'cost_price' => (string) $product->cost_price,
            'vat' => (string) $product->vat,
            'has_variants' => $product->has_variants,
            'sku' => $product->sku,
            'stock' => (string) $product->stock,
            'barcode' => $product->barcode,
            'is_active' => $product->is_active,
            'category_id' => $product->category_id,
            'sub_category_id' => $product->sub_category_id,
            'image_url' => $product->image_url,
            'additional_images' => $product->images
                ->map(fn ($image) => [
                    'id' => $image->id,
                    'image_url' => Storage::url($image->image_path),
                ])
                ->values(),
            'variants' => $product->variants
                ->map(fn ($variant) => [
                    'id' => $variant->id,
                    'variant_name' => $variant->variant_name,
                    'sku' => $variant->sku,
                    'price' => (string) $variant->price,
                    'cost_price' => (string) $variant->cost_price,
                    'stock' => (string) $variant->stock,
                    'barcode' => $variant->barcode,
                    'is_active' => $variant->is_active,
                ])
                ->values(),
        ];
    }

    protected function productDetailPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'unit' => $product->unit
                ? trim("{$product->unit->name} {$product->unit->symbol}")
                : null,
            'base_price' => number_format((float) $product->base_price, 2),
            'cost_price' => number_format((float) $product->cost_price, 2),
            'vat' => number_format((float) $product->vat, 2),
            'status' => $product->is_active ? 'Active' : 'Inactive',
            'category' => $product->category?->name,
            'sub_category' => $product->subCategory?->name,
            'image_url' => $product->image_url,
            'additional_images' => $product->images
                ->map(fn ($image) => [
                    'id' => $image->id,
                    'image_url' => Storage::url($image->image_path),
                ])
                ->values(),
            'variants' => $product->variants
                ->map(fn ($variant) => [
                    'id' => $variant->id,
                    'variant_name' => $variant->variant_name,
                    'sku' => $variant->sku,
                    'price' => number_format((float) $variant->price, 2),
                    'cost_price' => number_format((float) $variant->cost_price, 2),
                    'stock' => number_format((float) $variant->stock, 2),
                    'barcode' => $variant->barcode,
                    'status' => $variant->is_active ? 'Active' : 'Inactive',
                ])
                ->values(),
        ];
    }

    protected function categoryOptions()
    {
        return Category::query()
            ->whereNull('parent_id')
            ->with('subCategories')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'sub_categories' => $category->subCategories
                    ->map(fn (Category $subCategory) => [
                        'id' => $subCategory->id,
                        'name' => $subCategory->name,
                    ])
                    ->values(),
            ]);
    }

    protected function unitOptions()
    {
        return Unit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'symbol']);
    }
}
