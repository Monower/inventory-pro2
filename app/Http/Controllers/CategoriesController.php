<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class CategoriesController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return Inertia::render('Categories/Index', compact('categories'));
    }

    public function create()
    {
        return Inertia::render('Categories/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
        ]);

        Category::create($validated);

        return to_route('categories.index');
    }


    public function destroy(Category $category)
    {
        $category->delete();
        return to_route('categories.index');
    }


    public function edit($id){
        $category = Category::find($id);
        return Inertia::render('Categories/edit', compact('category'));
    }

    public function update(Request $request, $id){
        $category = Category::find($id);
        $category->name = $request->name;
        $category->save();
        return to_route('categories.index');
    }
}
