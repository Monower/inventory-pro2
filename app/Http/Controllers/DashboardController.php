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
        $totalRefunded = (float) Order::sum('refunded_amount');
        $netSales = max($totalIncome - $totalRefunded, 0);
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
                'title' => 'Refunded sales',
                'value' => $totalRefunded,
                'icon' => 'expense',
            ],
            [
                'title' => 'Net sales',
                'value' => $netSales,
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
            'salesAnalytics' => [
                'topCustomers' => $this->getTopCustomers(),
                'topProducts' => $this->getTopProducts(),
                'salesSummary' => $this->getSalesSummary(),
            ],
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

    private function getTopCustomers(): array
    {
        return Order::query()
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->selectRaw('customers.id, customers.name, customers.phone, SUM(orders.total_amount) as total_sales, COUNT(orders.id) as total_orders')
            ->groupBy('customers.id', 'customers.name', 'customers.phone')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name ?: 'N/A',
                'phone' => $item->phone,
                'total_sales' => (float) $item->total_sales,
                'total_orders' => (int) $item->total_orders,
            ])
            ->all();
    }

    private function getTopProducts(): array
    {
        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->selectRaw('products.id, products.name, SUM(order_items.quantity) as total_quantity, SUM(order_items.price * order_items.quantity) as total_sales')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sales')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'total_quantity' => (int) $item->total_quantity,
                'total_sales' => (float) $item->total_sales,
            ])
            ->all();
    }

    private function getSalesSummary(): array
    {
        return [
            'completed_orders' => (int) Order::where('order_status', 'completed')->count(),
            'refunded_orders' => (int) Order::whereIn('refund_status', ['partial', 'full'])->count(),
            'average_order_value' => (float) Order::avg('total_amount'),
            'pending_deliveries' => (int) Order::whereIn('fulfillment_status', ['pending', 'packed', 'shipped'])->count(),
        ];
    }
}
