import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { dateTimeFormater } from "@/util/DateFormater";
import { router } from "@inertiajs/react";
import { useState } from "react";
import DateRangeFilters from "@/Pages/Reports/Partials/DateRangeFilters";
import ReportNav from "@/Pages/Reports/Partials/ReportNav";
import SummaryCard from "@/Pages/Reports/Partials/SummaryCard";
import { currency } from "@/Pages/Reports/Partials/format";

const Orders = ({ orders, filters, summary }) => {
    const [query, setQuery] = useState(filters.q || "");
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || "");

    const applySecondaryFilters = (event) => {
        event.preventDefault();

        router.get(
            route("reports.orders"),
            {
                ...filters,
                q: query || undefined,
                payment_status: paymentStatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const exportParams = {
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        q: filters.q || undefined,
        payment_status: filters.payment_status || undefined,
    };

    return (
        <AuthenticatedLayout title="Orders Report">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                Orders Report
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Revenue, collections, and dues
                            </h1>
                        </div>
                        <a
                            href={route("reports.orders.export.excel", exportParams)}
                            className="create-button text-center"
                        >
                            Export Excel
                        </a>
                    </div>
                </div>

                <ReportNav />
                <DateRangeFilters
                    routeName="reports.orders"
                    filters={filters}
                    extra={{
                        q: filters.q || undefined,
                        payment_status: filters.payment_status || undefined,
                    }}
                />

                <form
                    onSubmit={applySecondaryFilters}
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-3"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search order number or customer"
                        className="custom-input"
                    />
                    <select
                        value={paymentStatus}
                        onChange={(event) => setPaymentStatus(event.target.value)}
                        className="custom-input"
                    >
                        <option value="">All payment status</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button type="submit" className="create-button">
                        Filter report
                    </button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Orders found" value={summary.total_orders} />
                    <SummaryCard
                        label="Order amount"
                        value={currency(summary.total_amount)}
                    />
                    <SummaryCard
                        label="Collected"
                        value={currency(summary.paid_amount)}
                    />
                    <SummaryCard
                        label="Due"
                        value={currency(summary.due_amount)}
                        tone={summary.due_amount > 0 ? "negative" : "default"}
                    />
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800/80">
                                <tr>
                                    {[
                                        "Order",
                                        "Customer",
                                        "Total",
                                        "Paid",
                                        "Due",
                                        "Status",
                                        "Created",
                                    ].map((label) => (
                                        <th
                                            key={label}
                                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {orders.data.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {order.order_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {order.customer?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(order.total_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(order.paid_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(order.due_amount)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {dateTimeFormater(order.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={orders.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Orders;
