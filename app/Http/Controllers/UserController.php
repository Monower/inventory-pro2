<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Branch;
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

        $users = User::with('roles')
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
        $roles = $this->assignableRolesQuery(request()->user())->get();
        $branches = Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        return Inertia::render('users/create', ['roles' => $roles, 'branches' => $branches]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => [
                'required',
                Rule::exists('roles', 'name')->where(
                    fn ($query) => $this->assignableRolesQuery($request->user(), $query)
                ),
            ],
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
            'branch_id' => $validated['branch_id'] ?? null,
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
        $user = User::with('roles')->findOrFail($user_id);
        $this->ensureCanManageUser(request()->user(), $user);
        $roles = $this->assignableRolesQuery(request()->user())->get();
        $branches = Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);
        return Inertia::render('users/edit', ['user' => $user, 'roles' => $roles, 'branches' => $branches]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user_id)
    {
        $user = User::findOrFail($user_id);
        $this->ensureCanManageUser($request->user(), $user);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone'    => 'nullable|string|max:20',
            'branch_id' => 'nullable|exists:branches,id',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role'     => [
                'required',
                Rule::exists('roles', 'name')->where(
                    fn ($query) => $this->assignableRolesQuery($request->user(), $query)
                ),
            ],
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
        $user->branch_id = $validated['branch_id'] ?? null;

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
        $user = User::findOrFail($user_id);
        $this->ensureCanManageUser(request()->user(), $user);
        $user->delete();
        return redirect()->route('users.index');
    }

    private function assignableRolesQuery(User $actor, $query = null)
    {
        $query ??= Role::query();

        if ($actor->hasRole('admin')) {
            return $query;
        }

        return $query->where('name', '!=', 'admin');
    }

    private function ensureCanManageUser(User $actor, User $subject): void
    {
        if (! $actor->hasRole('admin') && $subject->hasRole('admin')) {
            abort(403, 'You are not allowed to manage admin accounts.');
        }
    }
}
