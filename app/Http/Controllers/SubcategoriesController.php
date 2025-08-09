<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\SubCategory;

class SubcategoriesController extends Controller
{
    public function index()
    {
        $subcategories = new SubCategory();
        $subcategories = $subcategories->with('category')->get();
        return Inertia::render('subcategories/index', compact('subcategories'));
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('subcategories/create', compact('categories'));
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'category_id' => 'required',
        ]);

        SubCategory::create($validated);


        return to_route('subcategories.index');
    }


    public function edit($subcategory_id)
    {
        $subcategory = SubCategory::with('category')->find($subcategory_id);

        return Inertia::render('subcategories/edit', compact('subcategory'));

        // $categories = Category::all();


        // $categories = Category::all();
        // return Inertia::render('subcategories/edit', compact('subcategory', 'categories'));
    }


    public function destroy($subcategory_id)
    {
        SubCategory::find($subcategory_id)->delete();
        return to_route('subcategories.index');
    }
}
