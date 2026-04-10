<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()?->isSuperAdmin() && !$request->user()?->isOperatingInTenantContext()) {
            return redirect()->route('super-admin.dashboard');
        }

        $selectedSalesPeriod = $this->normalizePeriod(
            $request->string('sales_period')->toString() ?: 'week'
        );
        $selectedOrderPeriod = $this->normalizeOrderPeriod(
            $request->string('order_period')->toString() ?: 'week'
        );

        $total_product_count = Product::count();
        $total_expenses = Transaction::where(['transaction_type' => 'expense'])->sum('amount');
        $total_order_count = Order::count();
        $total_sold_value = Order::where(['payment_status' => 'paid'])->sum('paid_amount');
        $salesChart = $this->buildSalesChart($selectedSalesPeriod);
        $orderChart = $this->buildOrderChart($selectedOrderPeriod);

        $data = [
            [
                "title" => "Total Product Count",
                "heading" => $total_product_count,
                "icon" => "FiBox"
            ],
            [
                "title" => "Total sold value",
                "heading" => (int)$total_sold_value . " TK",
                "icon" => "CiDollar"
            ],
            [
                "title" => "Total order Count",
                "heading" => $total_order_count,
                "icon" => "LuTruck"
            ],
            [
                "title" => "Total expenses",
                "heading" => $total_expenses . " TK",
                "icon" => "MdOutlineMoneyOff"
            ],
        ];



        return Inertia::render('Dashboard', [
            'data' => $data,
            'filters' => [
                'salesPeriod' => $selectedSalesPeriod,
                'orderPeriod' => $selectedOrderPeriod,
            ],
            'salesChart' => $salesChart,
            'orderChart' => $orderChart,
        ]);
    }

    private function normalizePeriod(string $period): string
    {
        return in_array($period, ['day', 'week', 'month', 'year'], true)
            ? $period
            : 'week';
    }

    private function normalizeOrderPeriod(string $period): string
    {
        return in_array($period, ['time', 'day', 'week', 'month', 'year'], true)
            ? $period
            : 'week';
    }

    private function buildSalesChart(string $period): array
    {
        [$rangeStart, $rangeEnd, $points, $keyResolver, $rangeLabel] = $this->resolveChartBuckets($period);

        $orders = Order::query()
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->get(['created_at', 'total_amount']);

        $groupedOrders = $orders->groupBy(function (Order $order) use ($keyResolver) {
            return $keyResolver(Carbon::parse($order->created_at));
        });

        $chartPoints = collect($points)
            ->map(function (array $point) use ($groupedOrders) {
                $bucketOrders = $groupedOrders->get($point['key'], collect());

                return [
                    'label' => $point['label'],
                    'shortLabel' => $point['shortLabel'],
                    'value' => round((float) $bucketOrders->sum(fn (Order $order) => (float) $order->total_amount), 2),
                    'orders' => $bucketOrders->count(),
                ];
            })
            ->values();

        return [
            'period' => $period,
            'rangeLabel' => $rangeLabel,
            'totalSales' => round((float) $chartPoints->sum('value'), 2),
            'totalOrders' => $orders->count(),
            'points' => $chartPoints,
        ];
    }

    private function buildOrderChart(string $period): array
    {
        [$rangeStart, $rangeEnd, $points, $keyResolver, $rangeLabel] = $this->resolveOrderChartBuckets($period);

        $orders = Order::query()
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->get(['created_at', 'total_amount']);

        $groupedOrders = $orders->groupBy(function (Order $order) use ($keyResolver) {
            return $keyResolver(Carbon::parse($order->created_at));
        });

        $chartPoints = collect($points)
            ->map(function (array $point) use ($groupedOrders) {
                $bucketOrders = $groupedOrders->get($point['key'], collect());

                return [
                    'label' => $point['label'],
                    'shortLabel' => $point['shortLabel'],
                    'value' => $bucketOrders->count(),
                    'sales' => round((float) $bucketOrders->sum(fn (Order $order) => (float) $order->total_amount), 2),
                ];
            })
            ->values();

        return [
            'period' => $period,
            'rangeLabel' => str_replace('sales', 'orders', strtolower($rangeLabel)) === strtolower($rangeLabel)
                ? $rangeLabel
                : str_replace('sales', 'orders', $rangeLabel),
            'totalOrders' => $orders->count(),
            'totalSales' => round((float) $orders->sum(fn (Order $order) => (float) $order->total_amount), 2),
            'points' => $chartPoints,
        ];
    }

    private function resolveOrderChartBuckets(string $period): array
    {
        if ($period === 'time') {
            $timeBuckets = $this->buildDayBuckets(now());
            $timeBuckets[4] = 'Orders by time today';

            return $timeBuckets;
        }

        return $this->resolveChartBuckets($period);
    }

    private function resolveChartBuckets(string $period): array
    {
        $now = now();

        return match ($period) {
            'day' => $this->buildDayBuckets($now),
            'week' => $this->buildWeekBuckets($now),
            'month' => $this->buildMonthBuckets($now),
            'year' => $this->buildYearBuckets($now),
            default => $this->buildWeekBuckets($now),
        };
    }

    private function buildDayBuckets(Carbon $now): array
    {
        $start = $now->copy()->startOfDay();
        $end = $now->copy()->endOfDay();

        $points = collect(range(0, 23))->map(function (int $hour) use ($now) {
            $time = $now->copy()->startOfDay()->addHours($hour);

            return [
                'key' => str_pad((string) $hour, 2, '0', STR_PAD_LEFT),
                'label' => $time->format('g:00 A'),
                'shortLabel' => $time->format('g A'),
            ];
        })->all();

        return [
            $start,
            $end,
            $points,
            fn (Carbon $date) => $date->format('H'),
            'Today',
        ];
    }

    private function buildWeekBuckets(Carbon $now): array
    {
        $start = $now->copy()->startOfWeek();
        $end = $now->copy()->endOfWeek();
        $cursor = $start->copy();
        $points = [];

        while ($cursor->lte($end)) {
            $points[] = [
                'key' => $cursor->format('Y-m-d'),
                'label' => $cursor->format('D, j M'),
                'shortLabel' => $cursor->format('D'),
            ];
            $cursor->addDay();
        }

        return [
            $start,
            $end,
            $points,
            fn (Carbon $date) => $date->format('Y-m-d'),
            'This week',
        ];
    }

    private function buildMonthBuckets(Carbon $now): array
    {
        $start = $now->copy()->startOfYear();
        $end = $now->copy()->endOfYear();
        $cursor = $start->copy();
        $points = [];

        while ($cursor->lte($end)) {
            $points[] = [
                'key' => $cursor->format('Y-m'),
                'label' => $cursor->format('F'),
                'shortLabel' => $cursor->format('M'),
            ];
            $cursor->addMonth();
        }

        return [
            $start,
            $end,
            $points,
            fn (Carbon $date) => $date->format('Y-m'),
            'Monthly sales for ' . $now->format('Y'),
        ];
    }

    private function buildYearBuckets(Carbon $now): array
    {
        $firstOrderDate = Order::query()->oldest('created_at')->value('created_at');
        $start = $firstOrderDate
            ? Carbon::parse($firstOrderDate)->startOfYear()
            : $now->copy()->startOfYear();
        $end = $now->copy()->endOfYear();
        $cursor = $start->copy();
        $points = [];

        while ($cursor->lte($end)) {
            $points[] = [
                'key' => $cursor->format('Y'),
                'label' => $cursor->format('Y'),
                'shortLabel' => $cursor->format('Y'),
            ];
            $cursor->addYear();
        }

        return [
            $start,
            $end,
            $points,
            fn (Carbon $date) => $date->format('Y'),
            'Yearly sales',
        ];
    }
}
