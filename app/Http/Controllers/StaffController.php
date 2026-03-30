<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $staffs = Staff::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('salary', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('address', 'like', "%{$q}%");
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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('staffs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'size:11', Rule::unique('staff', 'phone')->where('tenant_id', $tenantId)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('staff', 'email')->where('tenant_id', $tenantId)],
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:1000',
        ]);

        Staff::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? '',
            'salary' => $validated['salary'] ?? 0,
            'address' => $validated['address'] ?? '',
        ]);

        return to_route('staffs.index')->with('success', 'Employee created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Staff $staff, $staff_id)
    {
        $staff = Staff::find($staff_id);
        return Inertia::render('staffs/show', ['staff' => $staff]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($staff_id)
    {
        $staff = Staff::find($staff_id);
        return Inertia::render('staffs/edit', ['staff' => $staff]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $staff_id)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'size:11', Rule::unique('staff', 'phone')->where('tenant_id', $tenantId)->ignore($staff_id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('staff', 'email')->where('tenant_id', $tenantId)->ignore($staff_id)],
            'salary' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:1000',
        ]);

        $staff = Staff::find($staff_id);

        if (!$staff) {
            return to_route('staffs.index')->with('error', 'Employee not found.');
        }

        $staff->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? '',
            'salary' => $validated['salary'] ?? 0,
            'address' => $validated['address'] ?? '',
        ]);

        return to_route('staffs.index')->with('success', 'Employee updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($staff_id)
    {
        $staff = Staff::find($staff_id);
        if (!$staff) {
            return to_route('staffs.index')->with('error', 'Employee not found.');
        }
        $staff->delete();
        return to_route('staffs.index')->with('success', 'Employee deleted successfully.');
    }
}
