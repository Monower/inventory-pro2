<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Purchase;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRevenue = (float) Order::sum('total_amount');
        $totalIncome = (float) Order::sum('paid_amount');
        $totalExpense = (float) Transaction::where('transaction_type', 'expense')->sum('amount');
        $accountPayable = (float) Purchase::sum(DB::raw('total_amount - paid_amount'));
        $accountReceivable = (float) Order::sum('due_amount');

        $businessStatistics = [
            [
                'title' => 'Total revenue',
                'value' => $totalRevenue,
                'icon' => 'revenue',
            ],
            [
                'title' => 'Total income',
                'value' => $totalIncome,
                'icon' => 'income',
            ],
            [
                'title' => 'Total expense',
                'value' => $totalExpense,
                'icon' => 'expense',
            ],
            [
                'title' => 'Account payable',
                'value' => $accountPayable,
                'icon' => 'payable',
            ],
            [
                'title' => 'Account receivable',
                'value' => $accountReceivable,
                'icon' => 'receivable',
            ],
        ];

        $earningStatistics = [
            'monthly' => $this->getMonthlyStatistics(),
            'yearly' => $this->getYearlyStatistics(),
        ];

        return Inertia::render('Dashboard', [
            'businessStatistics' => $businessStatistics,
            'earningStatistics' => $earningStatistics,
        ]);
    }

    private function getMonthlyStatistics(): array
    {
        $year = now()->year;
        $labels = collect(range(1, 12))->map(
            fn ($month) => Carbon::create($year, $month, 1)->format('M')
        );

        $income = Order::selectRaw('MONTH(created_at) as month, SUM(paid_amount) as total')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->pluck('total', 'month');

        $expense = Transaction::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->where('transaction_type', 'expense')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->pluck('total', 'month');

        return [
            'period' => (string) $year,
            'labels' => $labels->values()->all(),
            'income' => collect(range(1, 12))->map(
                fn ($month) => (float) ($income[$month] ?? 0)
            )->values()->all(),
            'expense' => collect(range(1, 12))->map(
                fn ($month) => (float) ($expense[$month] ?? 0)
            )->values()->all(),
        ];
    }

    private function getYearlyStatistics(): array
    {
        $currentYear = now()->year;
        $years = collect(range($currentYear - 5, $currentYear));

        $income = Order::selectRaw('YEAR(created_at) as year, SUM(paid_amount) as total')
            ->whereBetween('created_at', [
                now()->copy()->subYears(5)->startOfYear(),
                now()->copy()->endOfYear(),
            ])
            ->groupBy('year')
            ->pluck('total', 'year');

        $expense = Transaction::selectRaw('YEAR(created_at) as year, SUM(amount) as total')
            ->where('transaction_type', 'expense')
            ->whereBetween('created_at', [
                now()->copy()->subYears(5)->startOfYear(),
                now()->copy()->endOfYear(),
            ])
            ->groupBy('year')
            ->pluck('total', 'year');

        return [
            'period' => $years->first() . ' - ' . $years->last(),
            'labels' => $years->map(fn ($year) => (string) $year)->values()->all(),
            'income' => $years->map(fn ($year) => (float) ($income[$year] ?? 0))->values()->all(),
            'expense' => $years->map(fn ($year) => (float) ($expense[$year] ?? 0))->values()->all(),
        ];
    }
}
