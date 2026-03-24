import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import DashboardCard from "../Components/DasboardCard/DashboardCard";
import { formatCurrency } from "@/lib/currency";

function getNotificationLabel(item = {}, fallback = "Alert") {
    return (
        item.title ||
        item.name ||
        item.label ||
        item.reference ||
        item.order_number ||
        item.invoice_no ||
        item.customer_name ||
        item.supplier_name ||
        fallback
    );
}

function getNotificationAmount(item = {}, currencySymbol = "TK") {
    const amount =
        item.value ??
        item.amount ??
        item.due_amount ??
        item.total_due_amount ??
        item.outstanding_amount ??
        item.balance ??
        item.total_amount;

    if (amount === null || amount === undefined || amount === "") {
        return null;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return null;
    }

    return formatCurrency(numericAmount, currencySymbol);
}

function getNotificationHref(entity = {}) {
    if (entity.href || entity.url || entity.link) {
        return entity.href || entity.url || entity.link;
    }

    if ((entity.route || entity.routeName) && typeof route === "function") {
        try {
            const params = {
                ...(entity.params || entity.routeParams || entity.routeParameters || {}),
            };

            if (entity.query) {
                params._query = entity.query;
            }

            return route(
                entity.route || entity.routeName,
                params
            );
        } catch {
            return null;
        }
    }

    return null;
}

function NotificationSection({
    section = {},
    title,
    description,
    items = [],
    tone = "slate",
    currencySymbol = "TK",
}) {
    const toneClasses = {
        amber: {
            shell: "border-amber-500/20 bg-amber-500/10",
            badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            dot: "bg-amber-500",
        },
        rose: {
            shell: "border-rose-500/20 bg-rose-500/10",
            badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
            dot: "bg-rose-500",
        },
        sky: {
            shell: "border-sky-500/20 bg-sky-500/10",
            badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
            dot: "bg-sky-500",
        },
        violet: {
            shell: "border-violet-500/20 bg-violet-500/10",
            badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
            dot: "bg-violet-500",
        },
        emerald: {
            shell: "border-emerald-500/20 bg-emerald-500/10",
            badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            dot: "bg-emerald-500",
        },
        slate: {
            shell: "border-border bg-background/80",
            badge: "bg-muted text-muted-foreground",
            dot: "bg-muted-foreground",
        },
    };

    const styles = toneClasses[tone] || toneClasses.slate;
    const actionHref = getNotificationHref(section.action);

    return (
        <div className={`rounded-3xl border p-5 shadow-sm ${styles.shell}`}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {section?.action?.label && actionHref ? (
                        <Link
                            href={actionHref}
                            className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold text-foreground transition hover:border-foreground/20"
                        >
                            {section.action.label}
                        </Link>
                    ) : null}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                        {section.count ?? items.length}
                    </span>
                </div>
            </div>

            {items.length ? (
                <div className="space-y-3">
                    {items.slice(0, 5).map((item, index) => {
                        const href = getNotificationHref(item);
                        const label = getNotificationLabel(item, `${title} item`);
                        const amount = getNotificationAmount(item, currencySymbol);
                        const meta = item.meta || item.subtitle || item.description || item.note || item.reason;
                        const status = item.status || item.workflow_status || item.payment_status || item.fulfillment_status;
                        const createdAt = item.created_at || item.createdAt || item.date;
                        const content = (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{label}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            {status ? (
                                                <span className="rounded-full bg-background/80 px-2 py-1 font-medium text-foreground">
                                                    {status}
                                                </span>
                                            ) : null}
                                            {createdAt ? <span>{createdAt}</span> : null}
                                        </div>
                                    </div>
                                    {amount ? (
                                        <span className="shrink-0 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-foreground">
                                            {amount}
                                        </span>
                                    ) : null}
                                </div>
                                {meta ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {meta}
                                    </p>
                                ) : null}
                            </>
                        );

                        return href ? (
                            <Link
                                key={`${title}-${item.id || label}-${index}`}
                                href={href}
                                className="block rounded-2xl border border-border/70 bg-background/90 p-4 transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                            >
                                {content}
                            </Link>
                        ) : (
                            <div
                                key={`${title}-${item.id || label}-${index}`}
                                className="rounded-2xl border border-border/70 bg-background/90 p-4"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4">
                    <p className="text-sm text-muted-foreground">
                        No active alerts in this category.
                    </p>
                </div>
            )}
        </div>
    );
}

function NotificationCenter({ notifications = {}, currencySymbol = "TK" }) {
    const sections = Array.isArray(notifications?.sections)
        ? notifications.sections
        : [];
    const summary = notifications.summary || {};
    const totalAlerts = Number(summary.total || 0);
    const visibleSections = sections.filter(
        (section) => (section?.count ?? section?.items?.length ?? 0) > 0
    );
    const toneBySeverity = {
        critical: "amber",
        warning: "rose",
        info: "sky",
    };

    return (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Notification center
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                        Operational alerts at a glance
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        Monitor the issues that need attention now, including inventory pressure,
                        refund approvals, overdue receivables and payables, and deliveries still in motion.
                    </p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                    <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Total alerts
                        </p>
                        <p className="text-xl font-semibold text-foreground">{totalAlerts}</p>
                    </div>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                {[
                    { label: "Critical", value: Number(summary.critical || 0), tone: "amber" },
                    { label: "Warning", value: Number(summary.warning || 0), tone: "rose" },
                    { label: "Info", value: Number(summary.info || 0), tone: "sky" },
                    {
                        label: "Low stock threshold",
                        value: Number(summary.low_stock_threshold || 0),
                        tone: "violet",
                    },
                    {
                        label: "Overdue after days",
                        value: Number(summary.overdue_after_days || 0),
                        tone: "emerald",
                    },
                ].map((item) => {
                    const toneStyles = {
                        amber: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                        rose: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                        sky: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                        violet: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                        emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    };

                    return (
                        <div
                            key={item.label}
                            className={`rounded-2xl border p-4 ${toneStyles[item.tone]}`}
                        >
                            <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-80">
                                {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">
                                {item.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {visibleSections.length ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {visibleSections.map((section) => (
                        <div
                            key={section.key || section.title}
                            className={
                                section.key === "pending_deliveries"
                                    ? "xl:col-span-2"
                                    : ""
                            }
                        >
                            <NotificationSection
                                section={section}
                                title={section.title}
                                description={section.description}
                                items={Array.isArray(section.items) ? section.items : []}
                                tone={toneBySeverity[section.severity] || "slate"}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6">
                    <p className="text-sm text-muted-foreground">
                        No operational alerts are active right now.
                    </p>
                </div>
            )}
        </div>
    );
}

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
    notifications = {},
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

                <NotificationCenter
                    notifications={notifications}
                    currencySymbol={currencySymbol}
                />

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
