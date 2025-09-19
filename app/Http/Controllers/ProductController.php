<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Attribute;
use App\Models\AttributeValue;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['subCategory.category'])->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'selling_price' => $product->selling_price,
                'buying_price' => $product->buying_price,
                'stock' => $product->stock,
                'unit' => $product->unit,
                'description' => $product->description,
                'product_image' => $product->product_image,
                'subCategory' => $product->subCategory
                    ? [
                        'id' => $product->subCategory->id,
                        'name' => $product->subCategory->name,
                        'category' => $product->subCategory->category
                            ? [
                                'id' => $product->subCategory->category->id,
                                'name' => $product->subCategory->category->name,
                            ]
                            : null,
                    ]
                    : null,
            ];
        });

        return Inertia::render('product/index', compact('products'));
    }


    public function create()
    {
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        return Inertia::render('product/create', [
            'categories' => $categories,
            'attributes' => $attributes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'productName'   => 'required|string|max:255',
            'sellingPrice'  => 'required|numeric',
            'buyingPrice'   => 'required|numeric',
            'stock'         => 'required|integer',
            'unit'          => 'required|string|max:50',
            'description'   => 'nullable|string',
            'subCategory'   => 'required|exists:sub_categories,id',
            'productImage'  => 'nullable|image|max:2048',
            'attributes'    => 'array',
        ]);

        // handle image upload
        $path = null;
        if ($request->hasFile('productImage')) {
            $path = $request->file('productImage')->store('products', 'public');
        }

        // create product
        $product = Product::create([
            'name'            => $request->productName,
            'selling_price'   => $request->sellingPrice,
            'buying_price'    => $request->buyingPrice,
            'stock'           => $request->stock,
            'unit'            => $request->unit,
            'description'     => $request->description,
            'sub_category_id' => $request->subCategory,
            'product_image'   => $path,
        ]);

        // attach attributes and values
        if ($request->attributes) {
            foreach ($request->attributes as $attr) {
                if (!empty($attr['attribute_id']) && !empty($attr['attribute_value_ids'])) {
                    foreach ($attr['attribute_value_ids'] as $valueId) {
                        $product->attributes()->attach(
                            $attr['attribute_id'],
                            ['attribute_value_id' => $valueId]
                        );
                    }
                }
            }
        }

        return redirect()->route('products.index');
    }

    public function edit($id)
    {
        $product    = Product::with(['subCategory.category', 'attributes', 'attributes.values'])->findOrFail($id);

        
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();
        $attributeValues = AttributeValue::all();

        dd($attributeValues);

        // format selected attributes for frontend
        $selectedAttributes = [];
        foreach ($product->attributes as $attr) {
            $selectedAttributes[$attr->id][] = $attr->pivot->attribute_value_id;
        }

        return Inertia::render('product/edit', [
            'product'            => $product,
            'categories'         => $categories,
            'attributes'         => $attributes,
            'selectedAttributes' => $selectedAttributes,
        ]);
    }

    public function update($id, Request $request)
    {
        // dd($request->all(), $id);

        $request->validate([
            'productName'   => 'required|string|max:255',
            'sellingPrice'  => 'required|numeric',
            'buyingPrice'   => 'required|numeric',
            'stock'         => 'required|integer',
            'unit'          => 'required|string|max:50',
            'description'   => 'nullable|string',
            'subCategory'   => 'required|exists:sub_categories,id',
            'productImage'  => 'nullable|image|max:2048',
            'attributes'    => 'array',
        ]);

        $product = Product::findOrFail($id);

        // handle image upload
        $path = $product->product_image;
        if ($request->hasFile('productImage')) {
            $path = $request->file('productImage')->store('products', 'public');
        }

        // update product
        $product->update([
            'name'            => $request->productName,
            'selling_price'   => $request->sellingPrice,
            'buying_price'    => $request->buyingPrice,
            'stock'           => $request->stock,
            'unit'            => $request->unit,
            'description'     => $request->description,
            'sub_category_id' => $request->subCategory,
            'product_image'   => $path,
        ]);

        // sync attributes
        $product->attributes()->detach();
        if ($request->attributes) {
            foreach ($request->attributes as $attr) {
                if (!empty($attr['attribute_id']) && !empty($attr['attribute_value_ids'])) {
                    foreach ($attr['attribute_value_ids'] as $valueId) {
                        $product->attributes()->attach(
                            $attr['attribute_id'],
                            ['attribute_value_id' => $valueId]
                        );
                    }
                }
            }
        }

        return redirect()->route('products.index');
    }

    public function destroy($id)
    {
        Product::destroy($id);
        return redirect()->route('products.index');
    }
}
