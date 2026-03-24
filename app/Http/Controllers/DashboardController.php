<?php

namespace App\Http\Controllers;

use App\Models\BranchProductInventory;
use App\Models\Order;
use App\Models\OrderRefund;
use App\Models\Purchase;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private const LOW_STOCK_THRESHOLD = 5;

    private const OVERDUE_AFTER_DAYS = 7;

    private const NOTIFICATION_ITEM_LIMIT = 5;

    public function index()
    {
        $activeBranchId = $this->activeBranchId();

        $totalRevenue = (float) $this->branchScopedOrders($activeBranchId)->sum('total_amount');
        $totalIncome = (float) $this->branchScopedOrders($activeBranchId)->sum('paid_amount');
        $totalRefunded = (float) $this->branchScopedOrders($activeBranchId)->sum('refunded_amount');
        $netSales = max($totalIncome - $totalRefunded, 0);
        $totalExpense = (float) Transaction::where('transaction_type', 'expense')->sum('amount');
        $accountPayable = (float) $this->branchScopedPurchases($activeBranchId)->sum(DB::raw('total_amount - paid_amount'));
        $accountReceivable = (float) $this->branchScopedOrders($activeBranchId)->sum('due_amount');

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
            'notifications' => $this->getNotifications($activeBranchId),
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
        $activeBranchId = $this->activeBranchId();

        return Order::query()
            ->join('customers', 'customers.id', '=', 'orders.customer_id')
            ->when($activeBranchId, fn ($query) => $query->where('orders.branch_id', $activeBranchId))
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
        $activeBranchId = $this->activeBranchId();

        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->when($activeBranchId, fn ($query) => $query->where('orders.branch_id', $activeBranchId))
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
        $activeBranchId = $this->activeBranchId();

        return [
            'completed_orders' => (int) $this->branchScopedOrders($activeBranchId)->where('order_status', 'completed')->count(),
            'refunded_orders' => (int) $this->branchScopedOrders($activeBranchId)->whereIn('refund_status', ['partial', 'full'])->count(),
            'average_order_value' => (float) $this->branchScopedOrders($activeBranchId)->avg('total_amount'),
            'pending_deliveries' => (int) $this->branchScopedOrders($activeBranchId)
                ->whereIn('fulfillment_status', ['pending', 'packed', 'shipped'])
                ->count(),
        ];
    }

    private function getNotifications(?int $activeBranchId): array
    {
        $overdueCutoff = now()->subDays(self::OVERDUE_AFTER_DAYS);

        $lowStockItems = $this->getLowStockItems($activeBranchId);
        $pendingRefundItems = $this->getPendingRefundItems($activeBranchId);
        $overdueCustomerDueItems = $this->getOverdueCustomerDueItems($activeBranchId, $overdueCutoff);
        $overdueSupplierDueItems = $this->getOverdueSupplierDueItems($activeBranchId, $overdueCutoff);
        $pendingDeliveryItems = $this->getPendingDeliveryItems($activeBranchId);

        $sections = collect([
            [
                'key' => 'low_stock',
                'title' => 'Low stock',
                'severity' => 'critical',
                'count' => $lowStockItems['count'],
                'description' => 'Products at or below the stock threshold need replenishment attention.',
                'action' => [
                    'label' => 'Review products',
                    'route' => 'products.index',
                ],
                'items' => $lowStockItems['items'],
            ],
            [
                'key' => 'pending_refund_approvals',
                'title' => 'Pending refund approvals',
                'severity' => 'warning',
                'count' => $pendingRefundItems['count'],
                'description' => 'Return requests are waiting for manager review before stock and balances update.',
                'action' => [
                    'label' => 'Review orders',
                    'route' => 'orders.index',
                ],
                'items' => $pendingRefundItems['items'],
            ],
            [
                'key' => 'overdue_customer_dues',
                'title' => 'Overdue customer dues',
                'severity' => 'warning',
                'count' => $overdueCustomerDueItems['count'],
                'description' => 'Customer balances older than the overdue window should be followed up.',
                'action' => [
                    'label' => 'View orders',
                    'route' => 'orders.index',
                ],
                'items' => $overdueCustomerDueItems['items'],
            ],
            [
                'key' => 'overdue_supplier_dues',
                'title' => 'Overdue supplier dues',
                'severity' => 'warning',
                'count' => $overdueSupplierDueItems['count'],
                'description' => 'Outstanding supplier balances older than the overdue window may affect procurement flow.',
                'action' => [
                    'label' => 'Review purchases',
                    'route' => 'purchases.index',
                ],
                'items' => $overdueSupplierDueItems['items'],
            ],
            [
                'key' => 'pending_deliveries',
                'title' => 'Pending deliveries',
                'severity' => 'info',
                'count' => $pendingDeliveryItems['count'],
                'description' => 'Orders still moving through packing, shipping, or final delivery need follow-up.',
                'action' => [
                    'label' => 'Track deliveries',
                    'route' => 'orders.index',
                ],
                'items' => $pendingDeliveryItems['items'],
            ],
        ])->values();

        $criticalCount = (int) $sections->where('severity', 'critical')->sum('count');
        $warningCount = (int) $sections->where('severity', 'warning')->sum('count');
        $infoCount = (int) $sections->where('severity', 'info')->sum('count');

        return [
            'summary' => [
                'total' => (int) $sections->sum('count'),
                'critical' => $criticalCount,
                'warning' => $warningCount,
                'info' => $infoCount,
                'low_stock_threshold' => self::LOW_STOCK_THRESHOLD,
                'overdue_after_days' => self::OVERDUE_AFTER_DAYS,
            ],
            'sections' => $sections->all(),
        ];
    }

    private function getLowStockItems(?int $activeBranchId): array
    {
        if ($activeBranchId) {
            $items = BranchProductInventory::query()
                ->with(['product:id,name,unit'])
                ->where('branch_id', $activeBranchId)
                ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                ->orderBy('stock')
                ->orderBy('product_id')
                ->limit(self::NOTIFICATION_ITEM_LIMIT)
                ->get()
                ->map(fn ($inventory) => [
                    'id' => $inventory->id,
                    'title' => $inventory->product?->name ?? 'Unknown product',
                    'meta' => trim(implode(' ', array_filter([
                        'Current stock:',
                        (string) $inventory->stock,
                        $inventory->product?->unit,
                    ]))),
                    'value' => (int) $inventory->stock,
                    'route' => 'products.show',
                    'params' => ['product' => $inventory->product_id],
                ])
                ->all();

            return [
                'count' => (int) BranchProductInventory::query()
                    ->where('branch_id', $activeBranchId)
                    ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                    ->count(),
                'items' => $items,
            ];
        }

        $items = Product::query()
            ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
            ->orderBy('stock')
            ->orderBy('name')
            ->limit(self::NOTIFICATION_ITEM_LIMIT)
            ->get(['id', 'name', 'stock', 'unit'])
            ->map(fn ($product) => [
                'id' => $product->id,
                'title' => $product->name,
                'meta' => trim(implode(' ', array_filter([
                    'Current stock:',
                    (string) $product->stock,
                    $product->unit,
                ]))),
                'value' => (int) $product->stock,
                'route' => 'products.show',
                'params' => ['product' => $product->id],
            ])
            ->all();

        return [
            'count' => (int) Product::query()
                ->where('stock', '<=', self::LOW_STOCK_THRESHOLD)
                ->count(),
            'items' => $items,
        ];
    }

    private function getPendingRefundItems(?int $activeBranchId): array
    {
        $query = OrderRefund::query()
            ->with(['order.customer:id,name'])
            ->where('workflow_status', 'requested')
            ->when($activeBranchId, fn ($builder) => $builder->whereHas('order', fn ($orderQuery) => $orderQuery->where('branch_id', $activeBranchId)));

        $items = (clone $query)
            ->latest('refunded_at')
            ->limit(self::NOTIFICATION_ITEM_LIMIT)
            ->get()
            ->map(fn ($refund) => [
                'id' => $refund->id,
                'title' => $refund->refund_number,
                'meta' => collect([
                    $refund->order?->order_number,
                    $refund->order?->customer?->name,
                    'Requested ' . optional($refund->refunded_at)->diffForHumans(),
                ])->filter()->implode(' | '),
                'status' => ucfirst((string) $refund->workflow_status),
                'value' => (float) $refund->total_amount,
                'route' => 'orders.show',
                'params' => ['id' => $refund->order_id],
            ])
            ->all();

        return [
            'count' => (clone $query)->count(),
            'items' => $items,
        ];
    }

    private function getOverdueCustomerDueItems(?int $activeBranchId, Carbon $overdueCutoff): array
    {
        $query = $this->branchScopedOrders($activeBranchId)
            ->with('customer:id,name')
            ->where('due_amount', '>', 0)
            ->whereDate('created_at', '<=', $overdueCutoff->toDateString());

        $items = (clone $query)
            ->orderByDesc('due_amount')
            ->orderBy('created_at')
            ->limit(self::NOTIFICATION_ITEM_LIMIT)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'title' => $order->customer?->name ?: $order->order_number,
                'meta' => collect([
                    $order->order_number,
                    'Due for ' . Carbon::parse($order->created_at)->diffInDays(now()) . ' days',
                ])->implode(' | '),
                'value' => (float) $order->due_amount,
                'status' => ucfirst((string) $order->payment_status),
                'route' => 'orders.show',
                'params' => ['id' => $order->id],
            ])
            ->all();

        return [
            'count' => (clone $query)->count(),
            'items' => $items,
        ];
    }

    private function getOverdueSupplierDueItems(?int $activeBranchId, Carbon $overdueCutoff): array
    {
        $query = $this->branchScopedPurchases($activeBranchId)
            ->with('supplier:id,name')
            ->where('due_amount', '>', 0)
            ->whereDate('purchase_date', '<=', $overdueCutoff->toDateString());

        $items = (clone $query)
            ->orderByDesc('due_amount')
            ->orderBy('purchase_date')
            ->limit(self::NOTIFICATION_ITEM_LIMIT)
            ->get()
            ->map(fn ($purchase) => [
                'id' => $purchase->id,
                'title' => $purchase->supplier?->name ?: $purchase->supplier_name ?: $purchase->invoice_no,
                'meta' => collect([
                    $purchase->invoice_no,
                    'Due for ' . Carbon::parse($purchase->purchase_date)->diffInDays(now()) . ' days',
                ])->filter()->implode(' | '),
                'value' => (float) $purchase->due_amount,
                'status' => ucfirst((string) $purchase->payment_status),
                'route' => 'purchases.show',
                'params' => ['purchase' => $purchase->id],
            ])
            ->all();

        return [
            'count' => (clone $query)->count(),
            'items' => $items,
        ];
    }

    private function getPendingDeliveryItems(?int $activeBranchId): array
    {
        $query = $this->branchScopedOrders($activeBranchId)
            ->with('customer:id,name')
            ->whereIn('fulfillment_status', ['pending', 'packed', 'shipped'])
            ->where('order_status', '!=', 'cancelled');

        $items = (clone $query)
            ->latest()
            ->limit(self::NOTIFICATION_ITEM_LIMIT)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'title' => $order->order_number,
                'meta' => collect([
                    $order->customer?->name,
                    'Status: ' . ucfirst((string) $order->fulfillment_status),
                    'Created ' . Carbon::parse($order->created_at)->diffForHumans(),
                ])->filter()->implode(' | '),
                'value' => (float) $order->total_amount,
                'status' => ucfirst((string) $order->fulfillment_status),
                'route' => 'orders.show',
                'params' => ['id' => $order->id],
            ])
            ->all();

        return [
            'count' => (clone $query)->count(),
            'items' => $items,
        ];
    }

    private function branchScopedOrders(?int $activeBranchId): Builder
    {
        return Order::query()
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId));
    }

    private function branchScopedPurchases(?int $activeBranchId): Builder
    {
        return Purchase::query()
            ->when($activeBranchId, fn ($query) => $query->where('branch_id', $activeBranchId));
    }

    private function activeBranchId(): ?int
    {
        $user = request()->user();

        return $user?->branch_id ?: request()->session()->get('active_branch_id');
    }
}
