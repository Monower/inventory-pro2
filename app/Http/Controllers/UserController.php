<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get all users with their roles
        $users = User::with('roles')->get();

        return Inertia::render('users/index', [
            'users' => $users
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::where('name', '!=', 'admin')->get();
        return Inertia::render('users/create', ['roles' => $roles]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ✅ Validate request
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => 'required|exists:roles,name',
        ]);

        $imagePath = null;

        // ✅ Handle image upload with timestamp name
        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $imagePath = $file->storeAs('avatars', $filename, 'public');
        }

        // dd($imagePath);

        // ✅ Create user
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'avatar'   => $imagePath, // stored with timestamp name
        ]);

        // ✅ Assign role (Spatie Permissions)
        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'User created successfully!');
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($user_id)
    {
        $user = User::with('roles')->find($user_id);
        $roles = Role::where('name', '!=', 'admin')->get();
        return Inertia::render('users/edit', ['user' => $user, 'roles' => $roles]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user_id)
    {

        // dd($request->all());
        $user = User::findOrFail($user_id);

        // Validate request
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => 'required|exists:roles,name',
            'remove_image' => 'nullable|boolean',
        ]);

        // Handle image
        if ($request->hasFile('image')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $file = $request->file('image');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $user->avatar = $file->storeAs('avatars', $filename, 'public');
        } elseif (!empty($validated['remove_image'])) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
        }

        // Update user fields
        $user->name = $validated['name'] ?? $user->name;
        $user->email = $validated['email'] ?? $user->email;
        $user->phone = $validated['phone'] ?? $user->phone;

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        // Update role
        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')->with('success', 'User updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($user_id)
    {
        $user = User::find($user_id);
        $user->delete();
        return redirect()->route('users.index');
    }
}
