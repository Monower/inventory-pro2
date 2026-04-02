import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DateRangeFilters from "@/Pages/Reports/Partials/DateRangeFilters";
import ReportNav from "@/Pages/Reports/Partials/ReportNav";
import SummaryCard from "@/Pages/Reports/Partials/SummaryCard";
import { currency } from "@/Pages/Reports/Partials/format";

const ProfitLoss = ({ filters, summary, monthlyBreakdown }) => {
    const exportParams = {
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
    };

    return (
        <AuthenticatedLayout title="Profit & Loss">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                Profit & Loss
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Net performance across sales and expenses
                            </h1>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <a
                                href={route("reports.profit-loss.export.pdf", exportParams)}
                                className="rounded-2xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Export PDF
                            </a>
                            <a
                                href={route("reports.profit-loss.export.excel", exportParams)}
                                className="create-button text-center"
                            >
                                Export Excel
                            </a>
                        </div>
                    </div>
                </div>

                <ReportNav />
                <DateRangeFilters
                    routeName="reports.profit-loss"
                    filters={filters}
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        label="Sales revenue"
                        value={currency(summary.sales_revenue)}
                    />
                    <SummaryCard
                        label="Sales collected"
                        value={currency(summary.sales_collected)}
                    />
                    <SummaryCard
                        label="Cost of goods sold"
                        value={currency(summary.cost_of_goods_sold)}
                    />
                    <SummaryCard
                        label="Salary expense"
                        value={currency(summary.salary_expense)}
                    />
                    <SummaryCard
                        label="Other expense"
                        value={currency(summary.other_expense)}
                    />
                    <SummaryCard
                        label="Gross profit"
                        value={currency(summary.gross_profit)}
                        tone={summary.gross_profit >= 0 ? "positive" : "negative"}
                    />
                    <SummaryCard
                        label="Net profit"
                        value={currency(summary.net_profit)}
                        tone={summary.net_profit >= 0 ? "positive" : "negative"}
                    />
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Monthly breakdown
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800/80">
                                <tr>
                                    {[
                                        "Month",
                                        "Sales",
                                        "COGS",
                                        "Salary",
                                        "Other expense",
                                        "Net profit",
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
                                {monthlyBreakdown.map((row) => (
                                    <tr key={row.month}>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {row.month}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(row.sales)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(row.cogs)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(row.salary)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(row.other_expense)}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-sm font-semibold ${
                                                row.net_profit >= 0
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"
                                            }`}
                                        >
                                            {currency(row.net_profit)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default ProfitLoss;
