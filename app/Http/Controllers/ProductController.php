<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Attribute;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['subCategory.category', 'attributes'])->get();
        return Inertia::render('product/Index', compact('products'));
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
            'price'         => 'nullable|numeric',
            'subCategory'   => 'required|exists:sub_categories,id',
            'productImage'  => 'nullable|image|max:2048',
            'attributes'    => 'array',
        ]);

        // handle image
        $path = null;
        if ($request->hasFile('productImage')) {
            $path = $request->file('productImage')->store('products', 'public');
        }

        $product = Product::create([
            'name'            => $request->productName,
            'selling_price'   => $request->sellingPrice,
            'buying_price'    => $request->buyingPrice,
            'stock'           => $request->stock,
            'unit'            => $request->unit,
            'description'     => $request->description,
            'price'           => $request->price,
            'sub_category_id' => $request->subCategory,
            'product_image'   => $path,
        ]);

        // attach attributes
        if ($request->attributes) {
            foreach ($request->attributes as $attr) {
                if (!empty($attr['attribute_id']) && !empty($attr['attribute_value_id'])) {
                    $product->attributes()->attach(
                        $attr['attribute_id'],
                        ['attribute_value_id' => $attr['attribute_value_id']]
                    );
                }
            }
        }

        return redirect()->route('products.index');
    }

    public function edit($id)
    {
        $product    = Product::with(['subCategory.category', 'attributes'])->findOrFail($id);
        $categories = Category::with('subCategories')->get();
        $attributes = Attribute::with('values')->get();

        // format selected attributes
        $selectedAttributes = $product->attributes->map(function ($attr) {
            return [
                'attribute_id'       => $attr->id,
                'attribute_value_id' => $attr->pivot->attribute_value_id,
            ];
        });

        return Inertia::render('product/edit', [
            'product'            => $product,
            'categories'         => $categories,
            'attributes'         => $attributes,
            'selectedAttributes' => $selectedAttributes,
        ]);
    }

    public function update($id, Request $request)
    {
        $request->validate([
            'productName'   => 'required|string|max:255',
            'sellingPrice'  => 'required|numeric',
            'buyingPrice'   => 'required|numeric',
            'stock'         => 'required|integer',
            'unit'          => 'required|string|max:50',
            'description'   => 'nullable|string',
            'price'         => 'nullable|numeric',
            'subCategory'   => 'required|exists:sub_categories,id',
            'productImage'  => 'nullable|image|max:2048',
            'attributes'    => 'array',
        ]);

        $product = Product::findOrFail($id);

        // handle image
        $path = $product->product_image;
        if ($request->hasFile('productImage')) {
            $path = $request->file('productImage')->store('products', 'public');
        }

        $product->update([
            'name'            => $request->productName,
            'selling_price'   => $request->sellingPrice,
            'buying_price'    => $request->buyingPrice,
            'stock'           => $request->stock,
            'unit'            => $request->unit,
            'description'     => $request->description,
            'price'           => $request->price,
            'sub_category_id' => $request->subCategory,
            'product_image'   => $path,
        ]);

        // sync attributes
        $syncData = [];
        if ($request->attributes) {
            foreach ($request->attributes as $attr) {
                if (!empty($attr['attribute_id']) && !empty($attr['attribute_value_id'])) {
                    $syncData[$attr['attribute_id']] = [
                        'attribute_value_id' => $attr['attribute_value_id']
                    ];
                }
            }
        }
        $product->attributes()->sync($syncData);

        return redirect()->route('products.index');
    }

    public function destroy($id)
    {
        Product::destroy($id);
        return redirect()->route('products.index');
    }
}
