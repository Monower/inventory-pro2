import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import DateRangeFilters from "@/Pages/Reports/Partials/DateRangeFilters";
import ReportNav from "@/Pages/Reports/Partials/ReportNav";
import SummaryCard from "@/Pages/Reports/Partials/SummaryCard";
import { currency } from "@/Pages/Reports/Partials/format";

const Index = ({ filters, summary }) => {
    return (
        <AuthenticatedLayout title="Reports">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
                        Reporting Center
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Business performance in one place
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Review sales, purchases, salary expense, and profit trends
                        without bouncing between operational screens.
                    </p>
                </div>

                <ReportNav />
                <DateRangeFilters routeName="reports.index" filters={filters} />

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
                        label="Sales due"
                        value={currency(summary.sales_due)}
                    />
                    <SummaryCard
                        label="Purchase total"
                        value={currency(summary.purchase_total)}
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
                        label="Cost of goods sold"
                        value={currency(summary.cost_of_goods_sold)}
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

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            title: "Orders report",
                            description: "Track order totals, collections, and due balances.",
                            href: "/reports/orders",
                        },
                        {
                            title: "Purchase report",
                            description: "Review product purchase quantity, suppliers, and buying values.",
                            href: "/reports/purchases",
                        },
                        {
                            title: "Salary report",
                            description: "Follow monthly payroll by employee and payment status.",
                            href: "/reports/salaries",
                        },
                        {
                            title: "Profit & loss",
                            description: "See sales, cost of goods, expenses, and net profit together.",
                            href: "/reports/profit-loss",
                        },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                        >
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {item.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
