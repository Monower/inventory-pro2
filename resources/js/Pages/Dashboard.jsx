import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import DashboardCard from "../Components/DasboardCard/DashboardCard";
import { formatCurrency } from "@/lib/currency";

function EarningsChart({ data }) {
    const { settings } = usePage().props;
    const currencySymbol = settings?.currency_symbol || "TK";
    const { labels = [], income = [], expense = [] } = data || {};
    const chartData = labels.map((label, index) => ({
        label,
        income: Number(income[index] || 0),
        expense: Number(expense[index] || 0),
    }));

    const maxValue = Math.max(
        ...chartData.flatMap((item) => [item.income, item.expense]),
        0
    );

    const scaleMax = maxValue > 0 ? maxValue : 1;
    const axisLabels = Array.from({ length: 5 }, (_, index) =>
        Math.round((scaleMax / 4) * (4 - index))
    );

    return (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Earning statistics for business analytics
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Compare income and expense trends across {data?.period}.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        Income
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-3 w-3 rounded-full bg-rose-500" />
                        Expense
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[auto,1fr] gap-4">
                <div className="hidden h-72 flex-col justify-between py-2 text-xs text-muted-foreground sm:flex">
                    {axisLabels.map((value, index) => (
                        <span key={`${value}-${index}`}>
                            {formatCurrency(value, currencySymbol)}
                        </span>
                    ))}
                </div>

                <div className="flex h-72 items-stretch gap-2 overflow-x-auto pb-1">
                    {chartData.map((item) => (
                        <div
                            key={item.label}
                            className="flex min-w-[64px] flex-1 flex-col items-center justify-end gap-3"
                        >
                            <div className="flex h-full w-full items-end justify-center gap-1 rounded-2xl bg-muted/30 px-1 py-2">
                                <div
                                    className="w-full max-w-4 rounded-full bg-emerald-500 transition-all duration-300"
                                    style={{
                                        height: `${(item.income / scaleMax) * 100}%`,
                                    }}
                                    title={`${item.label} income: ${formatCurrency(item.income, currencySymbol)}`}
                                />
                                <div
                                    className="w-full max-w-4 rounded-full bg-rose-500 transition-all duration-300"
                                    style={{
                                        height: `${(item.expense / scaleMax) * 100}%`,
                                    }}
                                    title={`${item.label} expense: ${formatCurrency(item.expense, currencySymbol)}`}
                                />
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-xs font-medium text-foreground">
                                    {item.label}
                                </p>
                                <p className="hidden text-[11px] text-muted-foreground lg:block">
                                    {formatCurrency(item.income, currencySymbol)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AnalyticsTable({ title, rows = [], columns = [] }) {
    return (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-foreground">{title}</h2>
            {rows.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border text-left text-muted-foreground">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className="px-2 py-3 font-medium">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-border/60 last:border-b-0">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-2 py-3 text-foreground">
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No data available yet.</p>
            )}
        </div>
    );
}

export default function Dashboard({
    businessStatistics = [],
    earningStatistics = {},
    salesAnalytics = {},
}) {
    const { settings } = usePage().props;
    const currencySymbol = settings?.currency_symbol || "TK";
    const [activeView, setActiveView] = useState("monthly");
    const activeChart = earningStatistics?.[activeView] || {
        labels: [],
        income: [],
        expense: [],
        period: "",
    };
    const summary = salesAnalytics?.salesSummary || {};

    return (
        <AuthenticatedLayout
            title="Dashboard"
        >
            <section className="space-y-6 px-2 md:px-4">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                Business statistics
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                Dashboard overview
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                A quick summary of your current revenue flow,
                                business income, expenses, and outstanding balances.
                            </p>
                        </div>
                        <div className="inline-flex rounded-2xl border border-border bg-background p-1">
                            {["monthly", "yearly"].map((view) => (
                                <button
                                    key={view}
                                    type="button"
                                    onClick={() => setActiveView(view)}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
                                        activeView === view
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {businessStatistics.map((item) => (
                        <DashboardCard
                            key={item.title}
                            value={formatCurrency(item.value, currencySymbol)}
                            title={item.title}
                            icon={item.icon}
                            subtitle="Updated from recorded sales, purchases, and transactions"
                        />
                    ))}
                </div>

                <EarningsChart data={activeChart} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardCard
                        value={String(summary.completed_orders || 0)}
                        title="Completed orders"
                        icon="income"
                        subtitle="Orders moved to completed status"
                    />
                    <DashboardCard
                        value={String(summary.refunded_orders || 0)}
                        title="Refunded orders"
                        icon="expense"
                        subtitle="Orders with partial or full refunds"
                    />
                    <DashboardCard
                        value={formatCurrency(summary.average_order_value || 0, currencySymbol)}
                        title="Average order value"
                        icon="revenue"
                        subtitle="Average billed amount per order"
                    />
                    <DashboardCard
                        value={String(summary.pending_deliveries || 0)}
                        title="Pending deliveries"
                        icon="receivable"
                        subtitle="Orders not fully delivered yet"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AnalyticsTable
                        title="Top Customers"
                        rows={salesAnalytics?.topCustomers || []}
                        columns={[
                            { key: "name", label: "Customer" },
                            { key: "phone", label: "Phone" },
                            { key: "total_orders", label: "Orders" },
                            {
                                key: "total_sales",
                                label: "Sales",
                                render: (row) => formatCurrency(row.total_sales, currencySymbol),
                            },
                        ]}
                    />
                    <AnalyticsTable
                        title="Top Products"
                        rows={salesAnalytics?.topProducts || []}
                        columns={[
                            { key: "name", label: "Product" },
                            { key: "total_quantity", label: "Qty sold" },
                            {
                                key: "total_sales",
                                label: "Sales",
                                render: (row) => formatCurrency(row.total_sales, currencySymbol),
                            },
                        ]}
                    />
                </div>

            </section>
        </AuthenticatedLayout>
    );
}
