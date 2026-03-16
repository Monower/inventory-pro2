<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Setting;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $staffs = Staff::query()
            ->with(['roles', 'branch'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('salary', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('address', 'like', "%{$q}%")
                        ->orWhereHas('roles', fn ($roleQuery) => $roleQuery->where('name', 'like', "%{$q}%"))
                        ->orWhereHas('branch', fn ($branchQuery) => $branchQuery->where('name', 'like', "%{$q}%"));
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staffs/index', [
            'staffs' => $staffs,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('staffs/create', [
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        $phoneDigits = Setting::getPhoneDigits();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'digits:' . $phoneDigits, Rule::unique('staff', 'phone')],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('staff', 'email')],
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:1000',
            'password' => 'required|string|min:8',
            'branch_id' => 'nullable|exists:branches,id',
            'role' => 'required|exists:roles,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $avatarPath = $this->storeAvatar($request);

        $staff = Staff::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $this->normalizeNullableString($validated['email'] ?? null),
            'salary' => $validated['salary'] ?? null,
            'address' => $this->normalizeNullableString($validated['address'] ?? null),
            'password' => $validated['password'],
            'branch_id' => $validated['branch_id'] ?? null,
            'avatar' => $avatarPath,
        ]);

        $staff->assignRole($validated['role']);

        return to_route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function show(Staff $staff, $staff_id)
    {
        $staff = Staff::with(['roles', 'branch'])->find($staff_id);

        return Inertia::render('staffs/show', ['staff' => $staff]);
    }

    public function edit($staff_id)
    {
        $staff = Staff::with('roles')->findOrFail($staff_id);

        return Inertia::render('staffs/edit', [
            'staff' => $staff,
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function update(Request $request, $staff_id)
    {
        $staff = Staff::find($staff_id);

        if (! $staff) {
            return to_route('employees.index')->with('error', 'Employee not found.');
        }

        $phoneDigits = Setting::getPhoneDigits();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'digits:' . $phoneDigits, Rule::unique('staff', 'phone')->ignore($staff->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('staff', 'email')->ignore($staff->id)],
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:1000',
            'password' => 'nullable|string|min:8',
            'branch_id' => 'nullable|exists:branches,id',
            'role' => 'required|exists:roles,name',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_image' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($staff->avatar && Storage::disk('public')->exists($staff->avatar)) {
                Storage::disk('public')->delete($staff->avatar);
            }

            $staff->avatar = $this->storeAvatar($request);
        } elseif (!empty($validated['remove_image'])) {
            if ($staff->avatar && Storage::disk('public')->exists($staff->avatar)) {
                Storage::disk('public')->delete($staff->avatar);
            }

            $staff->avatar = null;
        }

        $staff->name = $validated['name'];
        $staff->phone = $validated['phone'];
        $staff->email = $this->normalizeNullableString($validated['email'] ?? null);
        $staff->salary = $validated['salary'] ?? null;
        $staff->address = $this->normalizeNullableString($validated['address'] ?? null);
        $staff->branch_id = $validated['branch_id'] ?? null;

        if (!empty($validated['password'])) {
            $staff->password = $validated['password'];
        }

        $staff->save();
        $staff->syncRoles([$validated['role']]);

        return to_route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy($staff_id)
    {
        $staff = Staff::find($staff_id);

        if (! $staff) {
            return to_route('employees.index')->with('error', 'Employee not found.');
        }

        if ((int) auth()->id() === (int) $staff->id) {
            return to_route('employees.index')->with('error', 'You cannot delete your own employee account.');
        }

        if ($staff->avatar && Storage::disk('public')->exists($staff->avatar)) {
            Storage::disk('public')->delete($staff->avatar);
        }

        $staff->delete();

        return to_route('employees.index')->with('success', 'Employee deleted successfully.');
    }

    private function normalizeNullableString(?string $value): ?string
    {
        $value = $value !== null ? trim($value) : null;

        return $value === '' ? null : $value;
    }

    private function storeAvatar(Request $request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $file = $request->file('image');
        $filename = time() . '.' . $file->getClientOriginalExtension();

        return $file->storeAs('avatars', $filename, 'public');
    }
}
