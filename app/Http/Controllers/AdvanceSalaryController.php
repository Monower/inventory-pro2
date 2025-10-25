<?php

namespace App\Http\Controllers;

use App\Models\AdvanceSalary;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvanceSalaryController extends Controller
{
    public function index()
    {
        $advances = AdvanceSalary::with('staff')->latest()->get();
        return Inertia::render('AdvanceSalaries/Index', [
            'advances' => $advances
        ]);
    }

    public function create()
    {
        $staff = Staff::all();
        return Inertia::render('AdvanceSalaries/Create', [
            'staff' => $staff
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'amount' => 'required|numeric|min:1',
            'installments' => 'required|integer|min:1',
            'start_month' => 'required|string',
        ]);

        $installmentAmount = round($request->amount / $request->installments, 2);

        AdvanceSalary::create([
            'staff_id' => $request->staff_id,
            'amount' => $request->amount,
            'installments' => $request->installments,
            'installment_amount' => $installmentAmount,
            'remaining_amount' => $request->amount,
            'start_month' => $request->start_month,
        ]);

        return redirect()->route('advance-salaries.index')->with('success', 'Advance salary added successfully');
    }
}
