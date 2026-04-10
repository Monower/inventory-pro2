import { router } from "@inertiajs/react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const periodOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
];

const currencyFormatter = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
});

function formatCurrency(value) {
    return `${currencyFormatter.format(Number(value || 0))} TK`;
}

function SalesTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const point = payload[0]?.payload;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Sales: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(point?.value)}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Orders: <span className="font-semibold text-slate-900 dark:text-slate-100">{point?.orders ?? 0}</span>
            </p>
        </div>
    );
}

export default function SalesChartCard({ salesChart, filters }) {
    const activePeriod = filters?.salesPeriod ?? "week";
    const points = salesChart?.points ?? [];

    const changePeriod = (period) => {
        router.get(
            route("dashboard"),
            {
                sales_period: period,
                order_period: filters?.orderPeriod ?? "week",
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                            Sales
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Sales overview
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Review sales performance for {salesChart?.rangeLabel?.toLowerCase() ?? "this period"}.
                        </p>
                    </div>

                    <div className="w-full max-w-[180px]">
                        <label
                            htmlFor="sales-period"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                        >
                            Period
                        </label>
                        <select
                            id="sales-period"
                            value={activePeriod}
                            onChange={(event) => changePeriod(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-300 dark:focus:ring-amber-500/10"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total sales</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(salesChart?.totalSales)}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Orders in range</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {salesChart?.totalOrders ?? 0}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-5 sm:px-6">
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={points}
                            margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.04} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                            <XAxis
                                dataKey="shortLabel"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                minTickGap={12}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                tickFormatter={(value) => currencyFormatter.format(value)}
                                width={64}
                            />
                            <Tooltip content={<SalesTooltip />} cursor={{ stroke: "#f59e0b", strokeOpacity: 0.25 }} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                fill="url(#salesFill)"
                                dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#0f172a", stroke: "#f59e0b", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {salesChart?.totalSales === 0 && (
                    <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                        No sales were recorded in this time range yet.
                    </p>
                )}
            </div>
        </section>
    );
}
