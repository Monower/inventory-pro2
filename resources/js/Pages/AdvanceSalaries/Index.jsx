import React from "react";
import { Link, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

export default function AdvanceIndex() {
    const { advances, company_name, filters } = usePage().props;
    const list = advances?.data ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`Advance / Loan Records - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Advance Salary Module
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Monitor staff advances and loans
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Keep track of outstanding balances, repayment
                                progress, and active employee advance records.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible advance rows
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href={route("advance-salaries.create")}
                                className="create-button"
                            >
                                Add Advance
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="advance-salaries.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search advances..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Staff</th>
                                    <th className="custom-th">Amount</th>
                                    <th className="custom-th">Installments</th>
                                    <th className="custom-th">Remaining</th>
                                    <th className="py-2 px-3 text-center rounded-r-md">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((a, index) => (
                                    <tr key={a.id} className="custom-body-tr">
                                        <td className="custom-body-td">{(advances.current_page - 1) * advances.per_page + index + 1}</td>
                                        <td className="custom-body-td">{a.staff.name}</td>
                                        <td className="custom-body-td">{a.amount}</td>
                                        <td className="custom-body-td">
                                            {a.installments}
                                        </td>
                                        <td className="custom-body-td">
                                            {a.remaining_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {a.status === "active" ? (
                                                <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-500/15 dark:text-green-300">
                                                    Completed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination links={advances?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
