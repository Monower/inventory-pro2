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
        $q = trim((string) request()->query('q', ''));

        $advances = AdvanceSalary::with('staff')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('amount', 'like', "%{$q}%")
                        ->orWhere('remaining_amount', 'like', "%{$q}%")
                        ->orWhere('status', 'like', "%{$q}%")
                        ->orWhereHas('staff', function ($staffQuery) use ($q) {
                            $staffQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('AdvanceSalaries/Index', [
            'advances' => $advances,
            'filters' => [
                'q' => $q,
            ],
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
        ]);

        AdvanceSalary::create([
            'staff_id' => $request->staff_id,
            'amount' => $request->amount,
            'remaining_amount' => $request->amount,
        ]);

        return redirect()->route('advance-salaries.index')->with('success', 'Advance salary added successfully');
    }

    public function edit(AdvanceSalary $advanceSalary)
    {
        return Inertia::render('AdvanceSalaries/Edit', [
            'advanceSalary' => $advanceSalary->load('staff'),
            'staff' => Staff::all(),
        ]);
    }

    public function update(Request $request, AdvanceSalary $advanceSalary)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'amount' => 'required|numeric|min:1',
        ]);

        $recoveredAmount = (float) $advanceSalary->amount - (float) $advanceSalary->remaining_amount;
        $newAmount = (float) $request->amount;

        if ($newAmount < $recoveredAmount) {
            return back()
                ->withErrors([
                    'amount' => 'Amount cannot be less than the already recovered advance.',
                ])
                ->withInput();
        }

        if ($recoveredAmount > 0 && (int) $request->staff_id !== (int) $advanceSalary->staff_id) {
            return back()
                ->withErrors([
                    'staff_id' => 'You cannot change the employee after advance recovery has started.',
                ])
                ->withInput();
        }

        $remainingAmount = round($newAmount - $recoveredAmount, 2);

        $advanceSalary->update([
            'staff_id' => $request->staff_id,
            'amount' => $newAmount,
            'remaining_amount' => $remainingAmount,
            'status' => $remainingAmount > 0 ? 'active' : 'completed',
        ]);

        return redirect()->route('advance-salaries.index')->with('success', 'Advance salary updated successfully');
    }

    public function destroy(AdvanceSalary $advanceSalary)
    {
        $recoveredAmount = (float) $advanceSalary->amount - (float) $advanceSalary->remaining_amount;

        if ($recoveredAmount > 0) {
            return redirect()
                ->route('advance-salaries.index')
                ->with('error', 'This advance salary cannot be deleted because recovery has already started.');
        }

        $advanceSalary->delete();

        return redirect()->route('advance-salaries.index')->with('success', 'Advance salary deleted successfully');
    }
}
