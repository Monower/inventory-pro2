import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function AdvanceCreate({ staff }) {
    const { data, setData, post, processing, errors } = useForm({
        staff_id: "",
        amount: "",
        installments: "",
        start_month: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("advance-salaries.store"));
    };

    return (
        <AuthenticatedLayout>
            <section>
                {/* Header */}
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"advance-salaries.index"} />
                    <h3 className="heading">Add Advance Salary</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <div>
                                <label>Staff</label>
                                <select
                                    value={data.staff_id}
                                    onChange={(e) =>
                                        setData("staff_id", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">Select staff</option>
                                    {staff.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.staff_id && (
                                    <p className="text-red-600">
                                        {errors.staff_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                {errors.amount && (
                                    <p className="text-red-600">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label>Installments (months)</label>
                                <input
                                    type="number"
                                    value={data.installments}
                                    onChange={(e) =>
                                        setData("installments", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                {errors.installments && (
                                    <p className="text-red-600">
                                        {errors.installments}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label>Start Month (YYYY-MM)</label>
                                <input
                                    type="text"
                                    value={data.start_month}
                                    onChange={(e) =>
                                        setData("start_month", e.target.value)
                                    }
                                    className="w-full border p-2 rounded"
                                />
                                {errors.start_month && (
                                    <p className="text-red-600">
                                        {errors.start_month}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="create-button"
                            >
                                {processing ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
