import React from "react";
import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function AdvanceIndex() {
    const { advances, flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">
                        Advance / Loan Records
                    </h1>
                    <Link
                        href={route("advance-salaries.create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Add Advance
                    </Link>
                </div>

                {flash?.success && (
                    <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                        {flash.success}
                    </div>
                )}

                <table className="min-w-full bg-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm uppercase">
                            <th className="p-2">Staff</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Installments</th>
                            <th className="p-2">Remaining</th>
                            <th className="p-2">Status</th>
                        </tr>
                    </thead>
                    {advances.length === 0 && (
                        <tbody>
                            <tr>
                                <td
                                    colSpan="6"
                                    className="text-center text-sm text-gray-500"
                                >
                                    No data found
                                </td>
                            </tr>
                        </tbody>
                    )}
                    <tbody>
                        {advances.map((a) => (
                            <tr key={a.id} className="border-b">
                                <td className="p-2">{a.staff.name}</td>
                                <td className="p-2">{a.amount}</td>
                                <td className="p-2">{a.installments}</td>
                                <td className="p-2">{a.remaining_amount}</td>
                                <td className="p-2">
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
            </div>
        </AuthenticatedLayout>
    );
}
