import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { dateFormater } from "@/util/DateFormater";
import { router } from "@inertiajs/react";
import { useState } from "react";
import ReportNav from "@/Pages/Reports/Partials/ReportNav";
import SummaryCard from "@/Pages/Reports/Partials/SummaryCard";
import { currency } from "@/Pages/Reports/Partials/format";

const Salaries = ({ salaries, staff, filters, summary }) => {
    const [query, setQuery] = useState(filters.q || "");
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || "");
    const [staffId, setStaffId] = useState(String(filters.staff_id || ""));
    const [monthFrom, setMonthFrom] = useState(filters.month_from || "");
    const [monthTo, setMonthTo] = useState(filters.month_to || "");

    const exportParams = {
        q: filters.q || undefined,
        payment_status: filters.payment_status || undefined,
        staff_id: filters.staff_id || undefined,
        month_from: filters.month_from || undefined,
        month_to: filters.month_to || undefined,
    };

    const submit = (event) => {
        event.preventDefault();

        router.get(
            route("reports.salaries"),
            {
                q: query || undefined,
                payment_status: paymentStatus || undefined,
                staff_id: staffId || undefined,
                month_from: monthFrom || undefined,
                month_to: monthTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AuthenticatedLayout title="Salary Report">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                Employee Salary Report
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Payroll visibility by month and employee
                            </h1>
                        </div>
                        <a
                            href={route("reports.salaries.export.excel", exportParams)}
                            className="create-button text-center"
                        >
                            Export Excel
                        </a>
                    </div>
                </div>

                <ReportNav />

                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5"
                >
                    <input
                        type="month"
                        value={monthFrom}
                        onChange={(event) => setMonthFrom(event.target.value)}
                        className="custom-input"
                    />
                    <input
                        type="month"
                        value={monthTo}
                        onChange={(event) => setMonthTo(event.target.value)}
                        className="custom-input"
                    />
                    <select
                        value={staffId}
                        onChange={(event) => setStaffId(event.target.value)}
                        className="custom-input"
                    >
                        <option value="">All employees</option>
                        {staff.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={paymentStatus}
                        onChange={(event) => setPaymentStatus(event.target.value)}
                        className="custom-input"
                    >
                        <option value="">All status</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search employee or month"
                        className="custom-input"
                    />
                    <button type="submit" className="create-button md:col-span-2 xl:col-span-5">
                        Filter report
                    </button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard label="Salary rows" value={summary.total_rows} />
                    <SummaryCard
                        label="Basic salary"
                        value={currency(summary.gross_salary)}
                    />
                    <SummaryCard
                        label="Bonus"
                        value={currency(summary.total_bonus)}
                    />
                    <SummaryCard
                        label="Deductions"
                        value={currency(summary.total_deductions)}
                    />
                    <SummaryCard
                        label="Net salary"
                        value={currency(summary.net_salary)}
                    />
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800/80">
                                <tr>
                                    {[
                                        "Employee",
                                        "Month",
                                        "Basic",
                                        "Bonus",
                                        "Deductions",
                                        "Net",
                                        "Status",
                                        "Paid at",
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
                                {salaries.data.map((salary) => (
                                    <tr key={salary.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {salary.staff?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {salary.month}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(salary.basic_salary)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(salary.bonus)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(salary.deductions)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(salary.net_salary)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                {salary.is_paid ? "paid" : "unpaid"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {salary.paid_at ? dateFormater(salary.paid_at) : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={salaries.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Salaries;
