<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));
        $authUser = request()->user();

        $users = User::with('roles')
            ->when(!$authUser->isSuperAdmin(), function ($query) {
                $query->whereDoesntHave('roles', function ($roleQuery) {
                    $roleQuery->where('name', 'super-admin');
                });
            })
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhereHas('roles', function ($roleQuery) use ($q) {
                            $roleQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = $this->availableRoles(request()->user())->get();
        return Inertia::render('users/create', ['roles' => $roles]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $roles = $this->availableRoles($request->user())->pluck('name');

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => ['required', Rule::in($roles)],
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $file     = $request->file('image');
            $filename = time() . '.' . $file->getClientOriginalExtension();
            $imagePath = $file->storeAs('avatars', $filename, 'public');
        }

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'avatar'   => $imagePath, // stored with timestamp name
        ]);

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
        if (!$user || !$this->canManageUser(request()->user(), $user)) {
            abort(403);
        }

        $roles = $this->availableRoles(request()->user())->get();
        return Inertia::render('users/edit', ['user' => $user, 'roles' => $roles]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user_id)
    {

        $user = User::findOrFail($user_id);
        if (!$this->canManageUser($request->user(), $user)) {
            abort(403);
        }

        $roles = $this->availableRoles($request->user())->pluck('name');

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => ['required', Rule::in($roles)],
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
        if (!$user || !$this->canManageUser(request()->user(), $user)) {
            abort(403);
        }

        $user->delete();
        return redirect()->route('users.index');
    }

    protected function availableRoles(User $user)
    {
        return Role::query()
            ->when(!$user->isSuperAdmin(), function ($query) {
                $query->whereNotIn('name', ['admin', 'super-admin']);
            }, function ($query) {
                $query->where('name', '!=', 'admin');
            })
            ->orderBy('name');
    }

    protected function canManageUser(User $actor, User $subject): bool
    {
        return $actor->isSuperAdmin() || !$subject->hasRole('super-admin');
    }
}
