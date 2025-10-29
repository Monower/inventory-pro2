import React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";

export default function SalaryIndex() {
    const { salaries, flash } = usePage().props;

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

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="heading">Salary Sheet</h1>
                    <Link
                        href={route("salaries.create")}
                        className="create-button"
                    >
                        Generate Salary
                    </Link>
                </div>

                {flash?.success && (
                    <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                        {flash.success}
                    </div>
                )}

                <div className="table-div">
                    {salaries?.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Employee</th>
                                    <th className="custom-th">Month</th>
                                    <th className="custom-th">Net Salary</th>
                                    <th className="custom-th">Status</th>
                                    <th className="py-2 px-3 text-center rounded-r-md">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaries.map((s) => (
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
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
