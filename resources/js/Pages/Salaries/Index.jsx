import React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

export default function SalaryIndex() {
    const { salaries, filters } = usePage().props;
    const list = salaries?.data ?? [];

    const markAsPaid = (id) => {
        if (confirm("Mark this salary as paid?")) {
            router.put(
                route("salaries.markPaid", id),
                {},
                {
                    preserveScroll: true,
                }
            );
        }
    };

    return (
        <AuthenticatedLayout title="Salary Sheet">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="heading">Salary sheet</h1>
                    <Link
                        href={route("salaries.create")}
                        className="create-button"
                    >
                        Create Salary
                    </Link>
                </div>
                <IndexFilters
                    routeName="salaries.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search salaries..."
                    className="mb-4"
                />

                <div className="table-div">
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
                                                <span className="text-green-600 font-semibold">
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-semibold">
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="custom-body-td">
                                            {!s.is_paid && (
                                                <button
                                                    onClick={() =>
                                                        markAsPaid(s.id)
                                                    }
                                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                >
                                                    Mark paid
                                                </button>
                                            )}
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
