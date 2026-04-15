<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use App\Models\Staff;
use App\Models\AdvanceSalary;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Collection;

class SalaryController extends Controller
{
    public function index()
    {
        $q = trim((string) request()->query('q', ''));

        $salaries = Salary::with('staff')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($subQuery) use ($q) {
                    $subQuery->where('month', 'like', "%{$q}%")
                        ->orWhere('net_salary', 'like', "%{$q}%")
                        ->orWhereHas('staff', function ($staffQuery) use ($q) {
                            $staffQuery->where('name', 'like', "%{$q}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Salaries/Index', [
            'salaries' => $salaries,
            'filters' => [
                'q' => $q,
            ],
        ]);
    }

    public function create()
    {
        $staff = Staff::all();
        $activeAdvanceBalances = AdvanceSalary::query()
            ->selectRaw('staff_id, SUM(remaining_amount) as remaining_amount')
            ->where('status', 'active')
            ->groupBy('staff_id')
            ->pluck('remaining_amount', 'staff_id');

        return Inertia::render('Salaries/Create', [
            'staff' => $staff,
            'activeAdvanceBalances' => $activeAdvanceBalances,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id',
            'month' => 'required|string',
            'bonus' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'advance_deduction' => 'nullable|numeric|min:0',
        ]);

        $staff = Staff::findOrFail($request->staff_id);
        $month = $request->month;

        $basic = (float) $staff->salary;
        $bonus = (float) ($request->bonus ?? 0);
        $deductions = (float) ($request->deductions ?? 0);
        $advanceDeduction = (float) ($request->advance_deduction ?? 0);

        $activeAdvances = AdvanceSalary::query()
            ->where('staff_id', $staff->id)
            ->where('status', 'active')
            ->where('remaining_amount', '>', 0)
            ->orderBy('id')
            ->get();

        $outstandingAdvanceBalance = (float) $activeAdvances->sum('remaining_amount');

        if ($advanceDeduction > $outstandingAdvanceBalance) {
            return back()
                ->withErrors([
                    'advance_deduction' => 'Advance deduction cannot be greater than the remaining advance balance.',
                ])
                ->withInput();
        }

        DB::transaction(function () use ($activeAdvances, $advanceDeduction, $staff, $month, $basic, $bonus, $deductions) {
            $this->applyAdvanceDeduction($activeAdvances, $advanceDeduction);

            $netSalary = $basic + $bonus - $deductions - $advanceDeduction;

            Salary::create([
                'staff_id' => $staff->id,
                'month' => $month,
                'basic_salary' => $basic,
                'bonus' => $bonus,
                'deductions' => $deductions,
                'advance_deduction' => $advanceDeduction,
                'net_salary' => $netSalary,
                'is_paid' => false,
            ]);
        });

        return redirect()->route('salaries.index')->with('success', 'Salary generated successfully');
    }


    public function markPaid(Salary $salary)
    {
        if (!$salary->is_paid) {
            $salary->update([
                'is_paid' => true,
                'paid_at' => now()->toDateString(),
            ]);

            Transaction::create([
                'name' => 'Salary Payment - ' . ($salary->staff?->name ?? 'Employee') . ' - ' . $salary->month,
                'payment_method' => 'cash',
                'transaction_type' => 'expense',
                'source' => 'Salary',
                'amount' => $salary->net_salary,
            ]);
        }

        return redirect()->route('salaries.index')->with('success', 'Salary marked as paid successfully!');
    }

    public function destroy(Salary $salary)
    {
        $salary->delete();

        return redirect()->route('salaries.index')->with('success', 'Salary deleted successfully!');
    }

    protected function applyAdvanceDeduction(Collection $activeAdvances, float $advanceDeduction): void
    {
        $remainingDeduction = $advanceDeduction;

        foreach ($activeAdvances as $advance) {
            if ($remainingDeduction <= 0) {
                break;
            }

            $appliedAmount = min((float) $advance->remaining_amount, $remainingDeduction);
            $advance->remaining_amount = round((float) $advance->remaining_amount - $appliedAmount, 2);

            if ((float) $advance->remaining_amount <= 0) {
                $advance->remaining_amount = 0;
                $advance->status = 'completed';
            }

            $advance->save();
            $remainingDeduction = round($remainingDeduction - $appliedAmount, 2);
        }
    }
}
