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
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="heading">Advance / Loan Records</h1>
                    <Link
                        href={route("advance-salaries.create")}
                        className="create-button"
                    >
                        Create Advance Salary
                    </Link>
                </div>
                <IndexFilters
                    routeName="advance-salaries.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search advances..."
                    className="mb-4"
                />

                <div className="table-div">
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
                                                <span className="text-yellow-600 font-semibold">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="text-green-600 font-semibold">
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
