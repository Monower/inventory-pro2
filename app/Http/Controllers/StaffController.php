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
        $staff = new Staff();
        $staff->name = $request->name;
        $staff->email = $request->email;
        $staff->phone = $request->phone;
        $staff->salary = $request->salary;
        $staff->address = $request->address;
        $staff->save();

        return to_route('staffs.index');
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
        $staff = Staff::find($staff_id);
        $staff->name = $request->name;
        $staff->email = $request->email;
        $staff->phone = $request->phone;
        $staff->salary = $request->salary;
        $staff->address = $request->address;
        $staff->save();
        return to_route('staffs.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff, $staff_id)
    {
        $staff = Staff::find($staff_id);
        $staff->delete();
        return to_route('staffs.index');
    }
}
