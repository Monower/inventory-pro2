import React from "react";
import { useForm, Head } from "@inertiajs/react";
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
            <Head title="Create Advance Salary" />
            <section>
                {/* Header */}
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"advance-salaries.index"} />
                    <h3 className="heading">Create Advance Salary</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Staff
                                    </label>
                                </legend>

                                <select
                                    value={data.staff_id}
                                    onChange={(e) =>
                                        setData("staff_id", e.target.value)
                                    }
                                    className="custom-input"
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
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Amount
                                    </label>
                                </legend>

                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                                {errors.amount && (
                                    <p className="text-red-600">
                                        {errors.amount}
                                    </p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Installments (months)
                                    </label>
                                </legend>

                                <input
                                    type="number"
                                    value={data.installments}
                                    onChange={(e) =>
                                        setData("installments", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter number of installments"
                                />
                                {errors.installments && (
                                    <p className="text-red-600">
                                        {errors.installments}
                                    </p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Start Month (YYYY-MM)
                                    </label>
                                </legend>

                                <input
                                    type="text"
                                    value={data.start_month}
                                    onChange={(e) =>
                                        setData("start_month", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter start month"
                                />
                                {errors.start_month && (
                                    <p className="text-red-600">
                                        {errors.start_month}
                                    </p>
                                )}
                            </fieldset>
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
