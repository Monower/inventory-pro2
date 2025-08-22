<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\SubCategory;

class ProductController extends Controller
{
    public function index(){
        $products = Product::with(['subCategory', 'category'])->get();
        return Inertia::render('product/index', compact('products'));
    }

    public function create(){
        $categories = Category::with('subCategories')->get();
        return Inertia::render('product/create', compact('categories'));
    }

    public function store(Request $request){
        $product = new Product();
        $product->name = $request->productName;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->sub_category_id = $request->subCategory;
        $product->save();

        return redirect()->route('products.index');
    }

    public function edit(Product $product){
        return Inertia::render('product/edit', ['product' => $product]);
    }

    public function update(Product $product, Request $request){
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->sub_category_id = $request->sub_category_id;
        $product->save();
        return redirect()->route('products.index');
    }

    public function destroy(Product $product){
        $product->delete();
        return redirect()->route('products.index');
    }
}
