<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use App\Models\Staff;
use App\Models\AdvanceSalary;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryController extends Controller
{
    public function index()
    {
        $salaries = Salary::with('staff')->latest()->get();
        return Inertia::render('Salaries/Index', [
            'salaries' => $salaries
        ]);
    }

    public function create()
    {
        $staff = Staff::all();
        return Inertia::render('Salaries/Create', [
            'staff' => $staff
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'month' => 'required|string',
        ]);

        $staff = Staff::findOrFail($request->staff_id);
        $month = $request->month;

        $basic = $staff->salary;
        $bonus = $request->bonus ?? 0;
        $deductions = $request->deductions ?? 0;

        $advance = AdvanceSalary::where('staff_id', $staff->id)
            ->where('status', 'active')
            ->first();

        $advanceDeduction = 0;
        if ($advance) {
            $advanceDeduction = $advance->installment_amount;
            $advance->remaining_amount -= $advanceDeduction;
            $advance->months_adjusted += 1;

            if ($advance->remaining_amount <= 0 || $advance->months_adjusted >= $advance->installments) {
                $advance->status = 'completed';
                $advance->remaining_amount = 0;
            }

            $advance->save();
        }

        $netSalary = $basic + $bonus - ($deductions + $advanceDeduction);

        Salary::create([
            'staff_id' => $staff->id,
            'month' => $month,
            'basic_salary' => $basic,
            'bonus' => $bonus,
            'deductions' => $deductions + $advanceDeduction,
            'net_salary' => $netSalary,
            'is_paid' => false,
        ]);

        return redirect()->route('salaries.index')->with('success', 'Salary generated successfully');
    }


    public function markPaid(Salary $salary)
    {
        $salary->update(['is_paid' => true]);

        return redirect()->route('salaries.index')->with('success', 'Salary marked as paid successfully!');
    }
}
