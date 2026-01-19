<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $staffs = Staff::all();
        return Inertia::render('staffs/index', ['staffs' => $staffs]);
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
        $validated = $request->validate([
            'name' => 'required|max:255',
            'phone' => 'required|max:11|min:11',
        ]);

        if ($validated) {
            $staff = new Staff();
            $staff->name = $request->name;
            $staff->phone = $request->phone;
            $staff->email = $request->email ?? '';
            $staff->salary = $request->salary ?? 0;
            $staff->address = $request->address ?? '';
            $staff->save();

            return to_route('staffs.index');
        } else {
            return redirect()->back()->withErrors(['errors' => $validated]);
        }
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
        $validated = $request->validate([
            'name' => 'required|max:255',
            'phone' => 'required|max:11|min:11',
        ]);

        if ($validated) {
            $staff = Staff::find($staff_id);

            if (!$staff) {
                return redirect()->back()->withErrors(['errors' => 'Employee not found']);
            }


            $staff->name = $request->name;
            $staff->phone = $request->phone;
            $staff->email = $request->email ?? '';
            $staff->salary = $request->salary ?? 0;
            $staff->address = $request->address ?? '';
            $staff->save();

            return to_route('staffs.index');
        } else {
            return redirect()->back()->withErrors(['errors' => $validated]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($staff_id)
    {
        $staff = Staff::find($staff_id);
        $staff->delete();
        return to_route('staffs.index');
    }
}
