import React from "react";
import { Link, usePage, router, Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

export default function SalaryIndex() {
    const { salaries, company_name, filters } = usePage().props;
    const list = salaries?.data ?? [];
    const { delete: destroy, processing } = useForm();

    const markAsPaid = (id) => {
        if (confirm("Mark this salary as paid?")) {
            router.put(
                route("salaries.markPaid", id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => console.log("Salary marked as paid!"),
                }
            );
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this salary?")) {
            destroy(route("salaries.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Salary sheet - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Salary Module
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Track salary sheets and payment status
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review generated salaries, check unpaid records,
                                and update payroll status without leaving the page.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible salary rows
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href={route("salaries.create")}
                                className="create-button"
                            >
                                Generate salary
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="salaries.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search salaries..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Employee</th>
                                    <th className="custom-th">Month</th>
                                    <th className="custom-th">Net Salary</th>
                                    <th className="custom-th">Status</th>
                                    <th className="custom-th rounded-r-md">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">{s.staff.name}</td>
                                        <td className="custom-body-td">{s.month}</td>
                                        <td className="custom-body-td">{s.net_salary}</td>
                                        <td className="custom-body-td">
                                            {s.is_paid ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-500/15 dark:text-green-300">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-300">
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="custom-body-td flex items-center gap-2">
                                            {!s.is_paid && (
                                                <button
                                                    onClick={() =>
                                                        markAsPaid(s.id)
                                                    }
                                                    className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-green-700"
                                                >
                                                    Mark paid
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="delete-button"
                                                disabled={processing}
                                                title="Delete"
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination links={salaries?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
