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
    { value: "time", label: "Time" },
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

function OrderTooltip({ active, payload, label }) {
    if (!active || !payload?.length) {
        return null;
    }

    const point = payload[0]?.payload;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Orders: <span className="font-semibold text-slate-900 dark:text-slate-100">{point?.value ?? 0}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Sales: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(point?.sales)}</span>
            </p>
        </div>
    );
}

export default function OrderChartCard({ orderChart, filters }) {
    const activePeriod = filters?.orderPeriod ?? "week";
    const points = orderChart?.points ?? [];
    const xAxisKey = activePeriod === "time" ? "label" : "shortLabel";
    const minTickGap = activePeriod === "time" ? 24 : 12;

    const changePeriod = (period) => {
        router.get(
            route("dashboard"),
            {
                sales_period: filters?.salesPeriod ?? "week",
                order_period: period,
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
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                            Orders
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            Order overview
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Review order activity for {orderChart?.rangeLabel?.toLowerCase() ?? "this period"}.
                        </p>
                    </div>

                    <div className="w-full max-w-[180px]">
                        <label
                            htmlFor="order-period"
                            className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                        >
                            Period
                        </label>
                        <select
                            id="order-period"
                            value={activePeriod}
                            onChange={(event) => changePeriod(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-300 dark:focus:ring-sky-500/10"
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total orders</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {orderChart?.totalOrders ?? 0}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sales in range</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(orderChart?.totalSales)}
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
                                <linearGradient id="orderFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.04} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                            <XAxis
                                dataKey={xAxisKey}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                minTickGap={minTickGap}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: "#64748b", fontSize: 12 }}
                                width={48}
                            />
                            <Tooltip content={<OrderTooltip />} cursor={{ stroke: "#0ea5e9", strokeOpacity: 0.25 }} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                fill="url(#orderFill)"
                                dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: "#0f172a", stroke: "#0ea5e9", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {orderChart?.totalOrders === 0 && (
                    <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                        No orders were recorded in this time range yet.
                    </p>
                )}
            </div>
        </section>
    );
}
