<?php

namespace App\Http\Controllers;

use App\Exports\OrdersReportExport;
use App\Exports\ProductPurchasesReportExport;
use App\Exports\ProfitLossReportExport;
use App\Exports\SalariesReportExport;
use App\Models\Order;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\Salary;
use App\Models\Staff;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index()
    {
        $fromDate = request()->query('from_date', now()->startOfMonth()->toDateString());
        $toDate = request()->query('to_date', now()->toDateString());

        $ordersQuery = Order::query()
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate);

        $salesRevenue = (clone $ordersQuery)->sum('total_amount');
        $salesCollected = (clone $ordersQuery)->sum('paid_amount');
        $salesDue = (clone $ordersQuery)->sum('due_amount');

        $purchaseTotal = PurchaseItem::query()
            ->whereHas('purchase', function (Builder $query) use ($fromDate, $toDate) {
                $query->whereDate('purchase_date', '>=', $fromDate)
                    ->whereDate('purchase_date', '<=', $toDate);
            })
            ->sum('total');

        $salaryExpense = Salary::query()
            ->where('is_paid', true)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '>=', $fromDate)
            ->whereDate('paid_at', '<=', $toDate)
            ->sum('net_salary');

        $otherExpense = Transaction::query()
            ->where('transaction_type', 'expense')
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->where('source', '!=', 'Salary')
            ->where('name', 'not like', 'Product Purchase - %')
            ->sum('amount');

        $cogs = Order::query()
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->whereDate('orders.created_at', '>=', $fromDate)
            ->whereDate('orders.created_at', '<=', $toDate)
            ->sum(DB::raw('order_items.quantity * COALESCE(order_items.cost_price, 0)'));

        $grossProfit = $salesRevenue - $cogs;
        $netProfit = $grossProfit - $salaryExpense - $otherExpense;

        return Inertia::render('Reports/Index', [
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'summary' => [
                'sales_revenue' => round((float) $salesRevenue, 2),
                'sales_collected' => round((float) $salesCollected, 2),
                'sales_due' => round((float) $salesDue, 2),
                'purchase_total' => round((float) $purchaseTotal, 2),
                'salary_expense' => round((float) $salaryExpense, 2),
                'other_expense' => round((float) $otherExpense, 2),
                'cost_of_goods_sold' => round((float) $cogs, 2),
                'gross_profit' => round((float) $grossProfit, 2),
                'net_profit' => round((float) $netProfit, 2),
            ],
        ]);
    }

    public function orders()
    {
        $filters = $this->resolveDateFilters();
        $paymentStatus = trim((string) request()->query('payment_status', ''));
        $q = trim((string) request()->query('q', ''));

        $query = $this->ordersQuery($filters, $paymentStatus, $q);

        $summaryQuery = clone $query;

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Reports/Orders', [
            'orders' => $orders,
            'summary' => [
                'total_orders' => (clone $summaryQuery)->count(),
                'total_amount' => round((float) (clone $summaryQuery)->sum('total_amount'), 2),
                'paid_amount' => round((float) (clone $summaryQuery)->sum('paid_amount'), 2),
                'due_amount' => round((float) (clone $summaryQuery)->sum('due_amount'), 2),
            ],
            'filters' => [
                ...$filters,
                'payment_status' => $paymentStatus,
                'q' => $q,
            ],
        ]);
    }

    public function purchases()
    {
        $filters = $this->resolveDateFilters();
        $productId = request()->query('product_id');
        $q = trim((string) request()->query('q', ''));

        $query = $this->purchaseItemsQuery($filters, $productId, $q);

        $summaryQuery = clone $query;
        $purchaseItems = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Reports/ProductPurchases', [
            'purchaseItems' => $purchaseItems,
            'products' => Product::orderBy('name')->get(['id', 'name']),
            'summary' => [
                'line_count' => (clone $summaryQuery)->count(),
                'total_quantity' => (int) (clone $summaryQuery)->sum('quantity'),
                'total_amount' => round((float) (clone $summaryQuery)->sum('total'), 2),
                'average_buying_price' => round((float) ((clone $summaryQuery)->avg('buying_price') ?? 0), 2),
            ],
            'filters' => [
                ...$filters,
                'product_id' => $productId ? (int) $productId : '',
                'q' => $q,
            ],
        ]);
    }

    public function salaries()
    {
        $monthFrom = trim((string) request()->query('month_from', now()->startOfYear()->format('Y-m')));
        $monthTo = trim((string) request()->query('month_to', now()->format('Y-m')));
        $paymentStatus = trim((string) request()->query('payment_status', ''));
        $staffId = request()->query('staff_id');
        $q = trim((string) request()->query('q', ''));

        $query = $this->salariesQuery($monthFrom, $monthTo, $paymentStatus, $staffId, $q);

        $summaryQuery = clone $query;
        $salaries = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Reports/Salaries', [
            'salaries' => $salaries,
            'staff' => Staff::orderBy('name')->get(['id', 'name']),
            'summary' => [
                'total_rows' => (clone $summaryQuery)->count(),
                'gross_salary' => round((float) (clone $summaryQuery)->sum('basic_salary'), 2),
                'total_bonus' => round((float) (clone $summaryQuery)->sum('bonus'), 2),
                'total_deductions' => round((float) ((clone $summaryQuery)->sum('deductions') + (clone $summaryQuery)->sum('advance_deduction')), 2),
                'total_advance_deductions' => round((float) (clone $summaryQuery)->sum('advance_deduction'), 2),
                'net_salary' => round((float) (clone $summaryQuery)->sum('net_salary'), 2),
            ],
            'filters' => [
                'month_from' => $monthFrom,
                'month_to' => $monthTo,
                'payment_status' => $paymentStatus,
                'staff_id' => $staffId ? (int) $staffId : '',
                'q' => $q,
            ],
        ]);
    }

    public function profitLoss()
    {
        $filters = $this->resolveDateFilters();
        $profitLoss = $this->profitLossDataset($filters);

        return Inertia::render('Reports/ProfitLoss', [
            'filters' => $filters,
            'summary' => $profitLoss['summary'],
            'monthlyBreakdown' => $profitLoss['monthlyBreakdown'],
        ]);
    }

    public function exportOrdersExcel()
    {
        $filters = $this->resolveDateFilters();
        $paymentStatus = trim((string) request()->query('payment_status', ''));
        $q = trim((string) request()->query('q', ''));

        $rows = $this->ordersQuery($filters, $paymentStatus, $q)
            ->latest()
            ->get()
            ->map(fn (Order $order) => [
                $order->order_number,
                $order->customer?->name ?? '-',
                (float) $order->total_amount,
                (float) $order->paid_amount,
                (float) $order->due_amount,
                $order->payment_status,
                optional($order->created_at)->format('Y-m-d H:i:s'),
            ]);

        return Excel::download(new OrdersReportExport($rows), 'orders-report.xlsx');
    }

    public function exportPurchasesExcel()
    {
        $filters = $this->resolveDateFilters();
        $productId = request()->query('product_id');
        $q = trim((string) request()->query('q', ''));

        $rows = $this->purchaseItemsQuery($filters, $productId, $q)
            ->latest()
            ->get()
            ->map(fn (PurchaseItem $item) => [
                $item->purchase?->purchase_date,
                $item->purchase?->invoice_no,
                $item->purchase?->supplier_name ?? '-',
                $item->product?->name ?? '-',
                (int) $item->quantity,
                (float) $item->buying_price,
                (float) $item->total,
            ]);

        return Excel::download(new ProductPurchasesReportExport($rows), 'product-purchase-report.xlsx');
    }

    public function exportSalariesExcel()
    {
        $monthFrom = trim((string) request()->query('month_from', now()->startOfYear()->format('Y-m')));
        $monthTo = trim((string) request()->query('month_to', now()->format('Y-m')));
        $paymentStatus = trim((string) request()->query('payment_status', ''));
        $staffId = request()->query('staff_id');
        $q = trim((string) request()->query('q', ''));

        $rows = $this->salariesQuery($monthFrom, $monthTo, $paymentStatus, $staffId, $q)
            ->latest()
            ->get()
            ->map(fn (Salary $salary) => [
                $salary->staff?->name ?? '-',
                $salary->month,
                (float) $salary->basic_salary,
                (float) $salary->bonus,
                (float) $salary->deductions,
                (float) $salary->advance_deduction,
                (float) $salary->net_salary,
                $salary->is_paid ? 'Paid' : 'Unpaid',
                $salary->paid_at,
            ]);

        return Excel::download(new SalariesReportExport($rows), 'employee-salary-report.xlsx');
    }

    public function exportProfitLossExcel()
    {
        $profitLoss = $this->profitLossDataset($this->resolveDateFilters());

        $rows = collect($profitLoss['monthlyBreakdown'])->map(fn (array $row) => [
            $row['month'],
            (float) $row['sales'],
            (float) $row['cogs'],
            (float) $row['salary'],
            (float) $row['other_expense'],
            (float) $row['net_profit'],
        ]);

        return Excel::download(new ProfitLossReportExport($rows), 'profit-loss-report.xlsx');
    }

    public function exportProfitLossPdf()
    {
        $filters = $this->resolveDateFilters();
        $profitLoss = $this->profitLossDataset($filters);

        $pdf = Pdf::loadView('reports.profit-loss-pdf', [
            'filters' => $filters,
            'summary' => $profitLoss['summary'],
            'monthlyBreakdown' => $profitLoss['monthlyBreakdown'],
            'range' => $profitLoss['range'],
        ])->setPaper('a4', 'portrait');

        return $pdf->download('profit-loss-report.pdf');
    }

    protected function resolveDateFilters(): array
    {
        return [
            'from_date' => trim((string) request()->query('from_date', '')),
            'to_date' => trim((string) request()->query('to_date', '')),
        ];
    }

    protected function ordersQuery(array $filters, string $paymentStatus, string $q): Builder
    {
        return Order::with(['customer', 'items.product'])
            ->when($filters['from_date'], fn ($builder, $fromDate) => $builder->whereDate('created_at', '>=', $fromDate))
            ->when($filters['to_date'], fn ($builder, $toDate) => $builder->whereDate('created_at', '<=', $toDate))
            ->when($paymentStatus !== '', fn ($builder) => $builder->where('payment_status', $paymentStatus))
            ->when($q !== '', function ($builder) use ($q) {
                $builder->where(function ($subQuery) use ($q) {
                    $subQuery->where('order_number', 'like', "%{$q}%")
                        ->orWhere('total_amount', 'like', "%{$q}%")
                        ->orWhere('paid_amount', 'like', "%{$q}%")
                        ->orWhere('due_amount', 'like', "%{$q}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($q) {
                            $customerQuery->where('name', 'like', "%{$q}%");
                        });
                });
            });
    }

    protected function purchaseItemsQuery(array $filters, mixed $productId, string $q): Builder
    {
        return PurchaseItem::with(['product', 'purchase'])
            ->when($filters['from_date'], function ($builder, $fromDate) {
                $builder->whereHas('purchase', fn (Builder $purchaseQuery) => $purchaseQuery->whereDate('purchase_date', '>=', $fromDate));
            })
            ->when($filters['to_date'], function ($builder, $toDate) {
                $builder->whereHas('purchase', fn (Builder $purchaseQuery) => $purchaseQuery->whereDate('purchase_date', '<=', $toDate));
            })
            ->when($productId, fn ($builder) => $builder->where('product_id', $productId))
            ->when($q !== '', function ($builder) use ($q) {
                $builder->where(function ($subQuery) use ($q) {
                    $subQuery->whereHas('product', function ($productQuery) use ($q) {
                        $productQuery->where('name', 'like', "%{$q}%");
                    })->orWhereHas('purchase', function ($purchaseQuery) use ($q) {
                        $purchaseQuery->where('invoice_no', 'like', "%{$q}%")
                            ->orWhere('supplier_name', 'like', "%{$q}%");
                    });
                });
            });
    }

    protected function salariesQuery(string $monthFrom, string $monthTo, string $paymentStatus, mixed $staffId, string $q): Builder
    {
        return Salary::with('staff')
            ->when($monthFrom !== '', fn ($builder) => $builder->where('month', '>=', $monthFrom))
            ->when($monthTo !== '', fn ($builder) => $builder->where('month', '<=', $monthTo))
            ->when($paymentStatus !== '', fn ($builder) => $builder->where('is_paid', $paymentStatus === 'paid'))
            ->when($staffId, fn ($builder) => $builder->where('staff_id', $staffId))
            ->when($q !== '', function ($builder) use ($q) {
                $builder->where(function ($subQuery) use ($q) {
                    $subQuery->where('month', 'like', "%{$q}%")
                        ->orWhere('net_salary', 'like', "%{$q}%")
                        ->orWhereHas('staff', function ($staffQuery) use ($q) {
                            $staffQuery->where('name', 'like', "%{$q}%");
                        });
                });
            });
    }

    protected function profitLossDataset(array $filters): array
    {
        $fromDate = $filters['from_date'] ?: now()->startOfMonth()->toDateString();
        $toDate = $filters['to_date'] ?: now()->toDateString();

        $salesRevenue = Order::query()
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->sum('total_amount');

        $salesCollected = Order::query()
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->sum('paid_amount');

        $costOfGoodsSold = Order::query()
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->whereDate('orders.created_at', '>=', $fromDate)
            ->whereDate('orders.created_at', '<=', $toDate)
            ->sum(DB::raw('order_items.quantity * COALESCE(order_items.cost_price, 0)'));

        $salaryExpense = Salary::query()
            ->where('is_paid', true)
            ->whereNotNull('paid_at')
            ->whereDate('paid_at', '>=', $fromDate)
            ->whereDate('paid_at', '<=', $toDate)
            ->sum('net_salary');

        $otherExpense = Transaction::query()
            ->where('transaction_type', 'expense')
            ->whereDate('created_at', '>=', $fromDate)
            ->whereDate('created_at', '<=', $toDate)
            ->where('source', '!=', 'Salary')
            ->where('name', 'not like', 'Product Purchase - %')
            ->sum('amount');

        $grossProfit = $salesRevenue - $costOfGoodsSold;
        $netProfit = $grossProfit - $salaryExpense - $otherExpense;

        $months = collect();
        $monthCursor = Carbon::parse($fromDate)->startOfMonth();
        $monthLimit = Carbon::parse($toDate)->startOfMonth();

        while ($monthCursor->lte($monthLimit)) {
            $months->push($monthCursor->copy());
            $monthCursor->addMonth();
        }

        $monthlyBreakdown = $months->map(function (Carbon $month) {
            $monthKey = $month->format('Y-m');

            $monthlySales = Order::query()
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total_amount');

            $monthlyCogs = Order::query()
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->whereYear('orders.created_at', $month->year)
                ->whereMonth('orders.created_at', $month->month)
                ->sum(DB::raw('order_items.quantity * COALESCE(order_items.cost_price, 0)'));

            $monthlySalary = Salary::query()
                ->where('is_paid', true)
                ->whereYear('paid_at', $month->year)
                ->whereMonth('paid_at', $month->month)
                ->sum('net_salary');

            $monthlyExpense = Transaction::query()
                ->where('transaction_type', 'expense')
                ->where('source', '!=', 'Salary')
                ->where('name', 'not like', 'Product Purchase - %')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');

            return [
                'month' => $monthKey,
                'sales' => round((float) $monthlySales, 2),
                'cogs' => round((float) $monthlyCogs, 2),
                'salary' => round((float) $monthlySalary, 2),
                'other_expense' => round((float) $monthlyExpense, 2),
                'net_profit' => round((float) ($monthlySales - $monthlyCogs - $monthlySalary - $monthlyExpense), 2),
            ];
        })->values()->all();

        return [
            'summary' => [
                'sales_revenue' => round((float) $salesRevenue, 2),
                'sales_collected' => round((float) $salesCollected, 2),
                'cost_of_goods_sold' => round((float) $costOfGoodsSold, 2),
                'salary_expense' => round((float) $salaryExpense, 2),
                'other_expense' => round((float) $otherExpense, 2),
                'gross_profit' => round((float) $grossProfit, 2),
                'net_profit' => round((float) $netProfit, 2),
            ],
            'monthlyBreakdown' => $monthlyBreakdown,
            'range' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
        ];
    }
}
